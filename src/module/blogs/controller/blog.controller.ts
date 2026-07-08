import prisma from "../../../config/prisma.js";
import { asyncHandler } from "../../../middleware/error.middleware.js";
import { blogValidator } from "../validator/blog.validation.js";
import { SuccessResponse, ErrorResponse } from "../../../utils/response.utils.js";
import { uploadToCloudinary } from "../../../config/cloudinary.js";

async function processBase64Image(base64String: string, folder: string): Promise<string> {
  if (!base64String || !base64String.startsWith('data:image')) {
    return base64String; 
  }
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3 || !matches[2]) {
    return base64String;
  }
  const imageBuffer = Buffer.from(matches[2] as string, 'base64');
  const result = await uploadToCloudinary(imageBuffer, folder);
  return result.secure_url;
}

export const createBlog = asyncHandler(async (req, res, next) => {
  try {
    const data = blogValidator.parse(req.body);
    const { title, content, excerpt, slug, author, tags, readTime } = data;

    let imageUrl = data.image || null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "blogs");
      imageUrl = uploadResult.secure_url;
    } else if (imageUrl) {
      imageUrl = await processBase64Image(imageUrl, "blogs");
    }

    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Check unique title
    const existingTitle = await prisma.blog.findFirst({
      where: { title }
    });
    if (existingTitle) {
      throw new ErrorResponse("A blog with this title already exists.", 400);
    }

    // Check unique slug
    const existingSlug = await prisma.blog.findUnique({
      where: { slug: finalSlug }
    });
    if (existingSlug) {
      throw new ErrorResponse("A blog with this slug already exists.", 400);
    }

    const isActive = data.isActive === undefined ? true : (data.isActive === "true" || data.isActive === true);

    const blog = await prisma.blog.create({
      data: {
        title,
        slug: finalSlug,
        content,
        excerpt: excerpt || null,
        image: imageUrl,
        author: author || "Admin",
        tags: tags ? (tags as any) : undefined,
        isActive,
        readTime: readTime || null,
      },
    });

    return SuccessResponse(res, "Blog created successfully", blog, 201);
  } catch (err) {
    console.error("Error in createBlog:", err);
    next(err);
  }
});

export const getAllBlogs = asyncHandler(async (req, res, next) => {
  const { page = "1", limit = "10", search, isActive, sort = "newest", tag } = req.query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (isActive !== undefined) {
    where.isActive = isActive === "true";
  }

  if (search) {
    const searchStr = search as string;
    where.OR = [
      { title: { contains: searchStr } },
      { content: { contains: searchStr } },
      { slug: { contains: searchStr } },
    ];
  }

  if (tag) {
    const tagStr = tag as string;
    where.tags = {
      contains: tagStr,
    };
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "title_asc") {
    orderBy = { title: "asc" };
  } else if (sort === "title_desc") {
    orderBy = { title: "desc" };
  } else if (sort === "oldest") {
    orderBy = { createdAt: "asc" };
  } else if (sort === "popular") {
    orderBy = { viewsCount: "desc" };
  }

  const [blogs, total] = await prisma.$transaction([
    prisma.blog.findMany({
      where,
      skip,
      take: limitNum,
      orderBy,
    }),
    prisma.blog.count({ where }),
  ]);

  const parsedBlogs = blogs.map(blog => ({
    ...blog,
    tags: (blog.tags as any) || [],
  }));

  return SuccessResponse(
    res,
    "Blogs fetched successfully",
    {
      blogs: parsedBlogs,
      pagination: {
        totalBlogs: total,
        totalPages: Math.ceil(total / limitNum),
        page: pageNum,
        limit: limitNum,
      },
    },
    200
  );
});

export const getBlogById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const blog = await prisma.blog.findUnique({
    where: { id }
  });

  if (!blog) {
    throw new ErrorResponse("Blog not found", 404);
  }

  // Increment views count asynchronously
  await prisma.blog.update({
    where: { id },
    data: { viewsCount: { increment: 1 } }
  }).catch((err: any) => console.error("Failed to increment views:", err));

  const parsedBlog = {
    ...blog,
    viewsCount: blog.viewsCount + 1,
    tags: (blog.tags as any) || [],
  };

  return SuccessResponse(res, "Blog fetched successfully", parsedBlog, 200);
});

export const getBlogBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const blog = await prisma.blog.findUnique({
    where: { slug }
  });

  if (!blog) {
    throw new ErrorResponse("Blog not found", 404);
  }

  // Increment views count asynchronously
  await prisma.blog.update({
    where: { slug },
    data: { viewsCount: { increment: 1 } }
  }).catch((err: any) => console.error("Failed to increment views:", err));

  const parsedBlog = {
    ...blog,
    viewsCount: blog.viewsCount + 1,
    tags: (blog.tags as any) || [],
  };

  return SuccessResponse(res, "Blog fetched successfully", parsedBlog, 200);
});

export const updateBlog = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = blogValidator.partial().parse(req.body);

    const existingBlog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!existingBlog) {
      throw new ErrorResponse("Blog not found", 404);
    }

    // Check unique title if changing
    if (data.title && data.title !== existingBlog.title) {
      const titleConflict = await prisma.blog.findFirst({
        where: { title: data.title, id: { not: id } }
      });
      if (titleConflict) {
        throw new ErrorResponse("A blog with this title already exists.", 400);
      }
    }

    // Determine slug
    let finalSlug = existingBlog.slug;
    if (data.slug) {
      finalSlug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    } else if (data.title && data.title !== existingBlog.title) {
      finalSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }

    // Check unique slug if changing
    if (finalSlug !== existingBlog.slug) {
      const slugConflict = await prisma.blog.findFirst({
        where: { slug: finalSlug, id: { not: id } }
      });
      if (slugConflict) {
        throw new ErrorResponse("A blog with this slug already exists.", 400);
      }
    }

    let imageUrl = data.image;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "blogs");
      imageUrl = uploadResult.secure_url;
    } else if (imageUrl) {
      imageUrl = await processBase64Image(imageUrl, "blogs");
    }

    const isActive = data.isActive === undefined 
      ? existingBlog.isActive 
      : (data.isActive === "true" || data.isActive === true);

    const updated = await prisma.blog.update({
      where: { id },
      data: {
        title: data.title,
        slug: finalSlug,
        content: data.content,
        excerpt: data.excerpt,
        image: imageUrl,
        author: data.author,
        tags: data.tags ? (data.tags as any) : undefined,
        isActive,
        readTime: data.readTime,
      }
    });

    const parsedUpdated = {
      ...updated,
      tags: (updated.tags as any) || [],
    };

    return SuccessResponse(res, "Blog updated successfully", parsedUpdated, 200);
  } catch (err) {
    console.error("Error in updateBlog:", err);
    next(err);
  }
});

export const deleteBlog = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const existingBlog = await prisma.blog.findUnique({
    where: { id }
  });

  if (!existingBlog) {
    throw new ErrorResponse("Blog not found", 404);
  }

  await prisma.blog.delete({
    where: { id }
  });

  return SuccessResponse(res, "Blog deleted successfully", null, 200);
});
