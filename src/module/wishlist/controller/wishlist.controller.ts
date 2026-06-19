import prisma from "../../../config/prisma.js";
import { asyncHandler } from "../../../middleware/error.middleware.js";
import { ErrorResponse, SuccessResponse } from "../../../utils/response.utils.js";
import { statusCode } from "../../../types/types.js";
import { toggleWishlistSchema } from "../validation/wishlist.validation.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";

// Bypass type check temporarily since prisma client has not been regenerated on this machine yet
const db = prisma as any;

// Fetch user's wishlist
export const getWishlist = asyncHandler<AuthenticatedRequest>(async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new ErrorResponse("Not authorized", statusCode.Unauthorized);
    }

    const wishlist = await db.wishlist.findMany({
        where: { userId },
        include: {
            product: {
                include: {
                    category: true,
                    subCategory: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return SuccessResponse(res, "Wishlist fetched successfully", wishlist, statusCode.OK);
});

// Add/Remove item to/from wishlist (Toggle)
export const toggleWishlistItem = asyncHandler<AuthenticatedRequest>(async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new ErrorResponse("Not authorized", statusCode.Unauthorized);
    }

    const validData = toggleWishlistSchema.parse(req.body);
    const { productId } = validData;

    // 1. Verify product exists
    const product = await db.product.findUnique({
        where: { id: productId }
    });

    if (!product) {
        throw new ErrorResponse("Product not found", statusCode.Not_Found);
    }

    // 2. Check if already in wishlist
    const existing = await db.wishlist.findUnique({
        where: {
            userId_productId: {
                userId,
                productId
            }
        }
    });

    if (existing) {
        // Remove from wishlist
        await db.wishlist.delete({
            where: {
                id: existing.id
            }
        });
        return SuccessResponse(res, "Product removed from wishlist", { added: false }, statusCode.OK);
    } else {
        // Add to wishlist
        const newWishlistItem = await db.wishlist.create({
            data: {
                userId,
                productId
            },
            include: {
                product: {
                    include: {
                        category: true,
                        subCategory: true
                    }
                }
            }
        });
        return SuccessResponse(res, "Product added to wishlist", { added: true, item: newWishlistItem }, statusCode.Created);
    }
});
