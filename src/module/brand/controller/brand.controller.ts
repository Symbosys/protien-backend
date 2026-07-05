import prisma from "../../../config/prisma.js";
import { asyncHandler } from "../../../middleware/error.middleware.js";
import { brandValidator } from "../validator/brand.validation.js";
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

export const createBrand = asyncHandler(async (req, res, next) => {
  try {
    const data = brandValidator.parse(req.body);
    const { name, description, slug, website } = data;

    let logoUrl = data.logo || null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "brands");
      logoUrl = uploadResult.secure_url;
    } else if (logoUrl) {
      logoUrl = await processBase64Image(logoUrl, "brands");
    }

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Check unique name
    const existingName = await prisma.brand.findUnique({
      where: { name }
    });
    if (existingName) {
      throw new ErrorResponse("A brand with this name already exists.", 400);
    }

    // Check unique slug
    const existingSlug = await prisma.brand.findUnique({
      where: { slug: finalSlug }
    });
    if (existingSlug) {
      throw new ErrorResponse("A brand with this slug already exists.", 400);
    }

    const isActive = data.isActive === undefined ? true : (data.isActive === "true" || data.isActive === true);

    const brand = await prisma.brand.create({
      data: {
        name,
        slug: finalSlug,
        description: description || null,
        logo: logoUrl,
        website: website || null,
        isActive,
      },
    });

    return SuccessResponse(res, "Brand created successfully", brand, 201);
  } catch (err) {
    console.error("Error in createBrand:", err);
    next(err);
  }
});

export const getAllBrands = asyncHandler(async (req, res, next) => {
  const { page = "1", limit = "10", search, isActive, sort = "newest" } = req.query;
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
      { name: { contains: searchStr } },
      { description: { contains: searchStr } },
      { slug: { contains: searchStr } },
    ];
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "name_asc") {
    orderBy = { name: "asc" };
  } else if (sort === "name_desc") {
    orderBy = { name: "desc" };
  } else if (sort === "oldest") {
    orderBy = { createdAt: "asc" };
  }

  const [brands, total] = await prisma.$transaction([
    prisma.brand.findMany({
      where,
      skip,
      take: limitNum,
      orderBy,
      include: {
        _count: {
          select: { products: true }
        }
      }
    }),
    prisma.brand.count({ where }),
  ]);

  return SuccessResponse(
    res,
    "Brands fetched successfully",
    {
      brands,
      pagination: {
        totalBrands: total,
        totalPages: Math.ceil(total / limitNum),
        page: pageNum,
        limit: limitNum,
      },
    },
    200
  );
});

export const getBrandById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  if (!brand) {
    throw new ErrorResponse("Brand not found", 404);
  }

  return SuccessResponse(res, "Brand fetched successfully", brand, 200);
});

export const getBrandBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  if (!brand) {
    throw new ErrorResponse("Brand not found", 404);
  }

  return SuccessResponse(res, "Brand fetched successfully", brand, 200);
});

export const updateBrand = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = brandValidator.partial().parse(req.body);

    const existingBrand = await prisma.brand.findUnique({
      where: { id }
    });

    if (!existingBrand) {
      throw new ErrorResponse("Brand not found", 404);
    }

    // Check unique name if changing
    if (data.name && data.name !== existingBrand.name) {
      const nameConflict = await prisma.brand.findFirst({
        where: { name: data.name, id: { not: id } }
      });
      if (nameConflict) {
        throw new ErrorResponse("A brand with this name already exists.", 400);
      }
    }

    // Determine slug
    let finalSlug = existingBrand.slug;
    if (data.slug) {
      finalSlug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    } else if (data.name && data.name !== existingBrand.name) {
      finalSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }

    // Check unique slug if changing
    if (finalSlug !== existingBrand.slug) {
      const slugConflict = await prisma.brand.findFirst({
        where: { slug: finalSlug, id: { not: id } }
      });
      if (slugConflict) {
        throw new ErrorResponse("A brand with this slug already exists.", 400);
      }
    }

    let logoUrl = data.logo;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "brands");
      logoUrl = uploadResult.secure_url;
    } else if (logoUrl) {
      logoUrl = await processBase64Image(logoUrl, "brands");
    }

    const isActive = data.isActive === undefined 
      ? existingBrand.isActive 
      : (data.isActive === "true" || data.isActive === true);

    const updated = await prisma.brand.update({
      where: { id },
      data: {
        name: data.name,
        slug: finalSlug,
        description: data.description,
        logo: logoUrl,
        website: data.website,
        isActive,
      }
    });

    return SuccessResponse(res, "Brand updated successfully", updated, 200);
  } catch (err) {
    console.error("Error in updateBrand:", err);
    next(err);
  }
});

export const deleteBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const existingBrand = await prisma.brand.findUnique({
    where: { id }
  });

  if (!existingBrand) {
    throw new ErrorResponse("Brand not found", 404);
  }

  // Check if products are linked
  const productCount = await prisma.product.count({
    where: { brandId: id }
  });

  if (productCount > 0) {
    throw new ErrorResponse("Cannot delete brand containing products. Please reassign or delete products first.", 400);
  }

  await prisma.brand.delete({
    where: { id }
  });

  return SuccessResponse(res, "Brand deleted successfully", null, 200);
});

export const getBrandProducts = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { page = "1", limit = "10" } = req.query;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const brand = await prisma.brand.findUnique({
    where: { id }
  });

  if (!brand) {
    throw new ErrorResponse("Brand not found", 404);
  }

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where: { brandId: id },
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" }
    }),
    prisma.product.count({
      where: { brandId: id }
    })
  ]);

  return SuccessResponse(
    res,
    "Brand products fetched successfully",
    {
      products,
      pagination: {
        totalProducts: total,
        totalPages: Math.ceil(total / limitNum),
        page: pageNum,
        limit: limitNum,
      }
    },
    200
  );
});
