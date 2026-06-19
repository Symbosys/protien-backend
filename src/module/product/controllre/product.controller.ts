import { asyncHandler } from "../../../middleware/error.middleware.js";
import { ErrorResponse, SuccessResponse } from "../../../utils/response.utils.js";
import { statusCode } from "../../../types/types.js";
import prisma from "../../../config/prisma.js";
import { createProductSchema, updateProductSchema } from "../validation/product.validation.js";

export const createProduct = asyncHandler(async (req, res, next) => {
    const validData = createProductSchema.parse(req.body);
    const { variants, ...productData } = validData;

    const product = await prisma.product.create({
        data: {
            ...productData,
            variants: variants ? {
                create: variants.map(variant => ({
                    sku: variant.sku,
                    price: variant.price,
                    discountPrice: variant.discountPrice,
                    quantity: variant.quantity,
                    image: variant.image,
                    attributeValues: {
                        connect: variant.attributeValues.map(id => ({ id }))
                    }
                }))
            } : undefined
        },
        include: {
            category: true,
            subCategory: true,
            variants: {
                include: {
                    attributeValues: {
                        include: {
                            attribute: true
                        }
                    }
                }
            }
        }
    });

    return SuccessResponse(res, "Product created successfully", product, statusCode.Created);
});

export const getAllProducts = asyncHandler(async (req, res, next) => {
    const {
        categoryId,
        subCategoryId,
        minPrice,
        maxPrice,
        search,
        brand,
        page = "1",
        limit = "20",
        sort = "newest",
        ...variantFiltersQuery
    } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Category filter
    if (categoryId) {
        where.categoryId = categoryId as string;
    }

    // SubCategory filter
    if (subCategoryId) {
        where.subCategoryId = subCategoryId as string;
    }

    // Brand filter
    if (brand) {
        where.brand = brand as string;
    }

    // Search across name, description, brand, and category name
    if (search) {
        const searchStr = search as string;
        where.OR = [
            { name: { contains: searchStr } },
            { description: { contains: searchStr } },
            { brand: { contains: searchStr } },
            { category: { name: { contains: searchStr } } },
        ];
    }

    // Price range filtering
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) {
            where.price.gte = parseFloat(minPrice as string);
        }
        if (maxPrice) {
            where.price.lte = parseFloat(maxPrice as string);
        }
    }

    // Dynamic attribute/variant filtering
    const activeAttributes = await prisma.attribute.findMany({
        select: { name: true }
    });

    const attributeMap = new Map(activeAttributes.map(attr => [attr.name.toLowerCase(), attr.name]));
    const andConditions: any[] = [];

    for (const [key, value] of Object.entries(variantFiltersQuery)) {
        const exactAttrName = attributeMap.get(key.toLowerCase());
        if (exactAttrName && value) {
            let valuesList: string[] = [];
            if (typeof value === 'string') {
                valuesList = value.split(',').map(v => v.trim());
            } else if (Array.isArray(value)) {
                valuesList = (value as string[]).map(v => String(v).trim());
            }

            if (valuesList.length > 0) {
                andConditions.push({
                    attributeValues: {
                        some: {
                            value: { in: valuesList },
                            attribute: {
                                name: exactAttrName
                            }
                        }
                    }
                });
            }
        }
    }

    if (andConditions.length > 0) {
        where.variants = {
            some: {
                AND: andConditions
            }
        };
    }

    // Sorting
    let orderBy: any;
    switch (sort) {
        case "price-asc":
            orderBy = { price: "asc" };
            break;
        case "price-desc":
            orderBy = { price: "desc" };
            break;
        case "rating":
            orderBy = { rating: "desc" };
            break;
        case "name-asc":
            orderBy = { name: "asc" };
            break;
        case "name-desc":
            orderBy = { name: "desc" };
            break;
        case "newest":
        default:
            orderBy = { createdAt: "desc" };
            break;
    }

    // Fetch products and total count in parallel
    const [products, total] = await prisma.$transaction([
        prisma.product.findMany({
            where,
            include: {
                category: true,
                subCategory: true,
                variants: {
                    include: {
                        attributeValues: {
                            include: {
                                attribute: true
                            }
                        }
                    }
                }
            },
            orderBy,
            skip,
            take: limitNum
        }),
        prisma.product.count({ where })
    ]);

    return SuccessResponse(res, "Products fetched successfully", {
        products,
        pagination: {
            total,
            totalPages: Math.ceil(total / limitNum),
            page: pageNum,
            limit: limitNum
        }
    }, statusCode.OK);
});

export const getProductById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: true,
            subCategory: true,
            variants: {
                include: {
                    attributeValues: {
                        include: {
                            attribute: true
                        }
                    }
                }
            }
        },
    });

    if (!product) {
        throw new ErrorResponse("Product not found", statusCode.Not_Found);
    }

    return SuccessResponse(res, "Product fetched successfully", product, statusCode.OK);
});

export const updateProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const validData = updateProductSchema.parse(req.body);
    const { variants, ...productData } = validData;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
        throw new ErrorResponse("Product not found", statusCode.Not_Found);
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
        if (variants !== undefined) {
            // Delete existing variants
            await tx.productVariant.deleteMany({
                where: { productId: id }
            });
        }

        const updated = await tx.product.update({
            where: { id },
            data: {
                ...productData,
                variants: (variants && variants.length > 0) ? {
                    create: variants.map(variant => ({
                        sku: variant.sku,
                        price: variant.price,
                        discountPrice: variant.discountPrice,
                        quantity: variant.quantity,
                        image: variant.image,
                        attributeValues: {
                            connect: variant.attributeValues.map(id => ({ id }))
                        }
                    }))
                } : undefined
            },
            include: {
                category: true,
                subCategory: true,
                variants: {
                    include: {
                        attributeValues: {
                            include: {
                                attribute: true
                            }
                        }
                    }
                }
            }
        });
        return updated;
    });

    return SuccessResponse(res, "Product updated successfully", updatedProduct, statusCode.OK);
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
        throw new ErrorResponse("Product not found", statusCode.Not_Found);
    }

    await prisma.product.delete({ where: { id } });

    return SuccessResponse(res, "Product deleted successfully", null, statusCode.OK);
});
