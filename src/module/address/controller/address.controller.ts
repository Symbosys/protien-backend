import prisma from "../../../config/prisma.js";
import { asyncHandler } from "../../../middleware/error.middleware.js";
import { ErrorResponse, SuccessResponse } from "../../../utils/response.utils.js";
import { statusCode } from "../../../types/types.js";
import { createAddressSchema, updateAddressSchema } from "../validation/address.validation.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";

// 1. Get all saved addresses of the current user
export const getAddresses = asyncHandler<AuthenticatedRequest>(async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new ErrorResponse("Not authorized", statusCode.Unauthorized);
    }

    const addresses = await prisma.address.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
    });

    return SuccessResponse(res, "Addresses retrieved successfully", addresses, statusCode.OK);
});

// 2. Get a single address by ID
export const getAddressById = asyncHandler<AuthenticatedRequest>(async (req, res, next) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
        throw new ErrorResponse("Not authorized", statusCode.Unauthorized);
    }

    const address = await prisma.address.findUnique({
        where: { id }
    });

    if (!address) {
        throw new ErrorResponse("Address not found", statusCode.Not_Found);
    }

    if (address.userId !== userId) {
        throw new ErrorResponse("Not authorized to view this address", statusCode.Forbidden);
    }

    return SuccessResponse(res, "Address retrieved successfully", address, statusCode.OK);
});

// 3. Add a new address
export const addAddress = asyncHandler<AuthenticatedRequest>(async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new ErrorResponse("Not authorized", statusCode.Unauthorized);
    }

    const validData = createAddressSchema.parse(req.body);

    // Check if the user has any existing address
    const existingAddressesCount = await prisma.address.count({
        where: { userId }
    });

    // If it's the first address, force it to be default
    const shouldBeDefault = existingAddressesCount === 0 ? true : !!validData.isDefault;

    const newAddress = await prisma.$transaction(async (tx) => {
        // If this address should be default, unset all other addresses as default
        if (shouldBeDefault) {
            await tx.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            });
        }

        return tx.address.create({
            data: {
                userId,
                name: validData.name,
                mobile: validData.mobile,
                pincode: validData.pincode,
                locality: validData.locality,
                address: validData.address,
                city: validData.city,
                state: validData.state,
                longitude: validData.longitude,
                latitude: validData.latitude,
                type: validData.type,
                isDefault: shouldBeDefault
            }
        });
    });

    return SuccessResponse(res, "Address added successfully", newAddress, statusCode.Created);
});

// 4. Update an address
export const updateAddress = asyncHandler<AuthenticatedRequest>(async (req, res, next) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
        throw new ErrorResponse("Not authorized", statusCode.Unauthorized);
    }

    const validData = updateAddressSchema.parse(req.body);

    const existingAddress = await prisma.address.findUnique({
        where: { id }
    });

    if (!existingAddress) {
        throw new ErrorResponse("Address not found", statusCode.Not_Found);
    }

    if (existingAddress.userId !== userId) {
        throw new ErrorResponse("Not authorized to update this address", statusCode.Forbidden);
    }

    const shouldBeDefault = validData.isDefault !== undefined ? validData.isDefault : existingAddress.isDefault;

    const updatedAddress = await prisma.$transaction(async (tx) => {
        // If setting this address as default, unset others
        if (shouldBeDefault && !existingAddress.isDefault) {
            await tx.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            });
        }

        return tx.address.update({
            where: { id },
            data: {
                name: validData.name,
                mobile: validData.mobile,
                pincode: validData.pincode,
                locality: validData.locality,
                address: validData.address,
                city: validData.city,
                state: validData.state,
                longitude: validData.longitude,
                latitude: validData.latitude,
                type: validData.type,
                isDefault: shouldBeDefault
            }
        });
    });

    return SuccessResponse(res, "Address updated successfully", updatedAddress, statusCode.OK);
});

// 5. Delete an address
export const deleteAddress = asyncHandler<AuthenticatedRequest>(async (req, res, next) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
        throw new ErrorResponse("Not authorized", statusCode.Unauthorized);
    }

    const existingAddress = await prisma.address.findUnique({
        where: { id }
    });

    if (!existingAddress) {
        throw new ErrorResponse("Address not found", statusCode.Not_Found);
    }

    if (existingAddress.userId !== userId) {
        throw new ErrorResponse("Not authorized to delete this address", statusCode.Forbidden);
    }

    await prisma.$transaction(async (tx) => {
        // Delete the address
        await tx.address.delete({
            where: { id }
        });

        // If we deleted the default address, make the next latest address default
        if (existingAddress.isDefault) {
            const nextAddress = await tx.address.findFirst({
                where: { userId },
                orderBy: { createdAt: "desc" }
            });

            if (nextAddress) {
                await tx.address.update({
                    where: { id: nextAddress.id },
                    data: { isDefault: true }
                });
            }
        }
    });

    return SuccessResponse(res, "Address deleted successfully", null, statusCode.OK);
});

// 6. Set default address
export const setDefaultAddress = asyncHandler<AuthenticatedRequest>(async (req, res, next) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
        throw new ErrorResponse("Not authorized", statusCode.Unauthorized);
    }

    const existingAddress = await prisma.address.findUnique({
        where: { id }
    });

    if (!existingAddress) {
        throw new ErrorResponse("Address not found", statusCode.Not_Found);
    }

    if (existingAddress.userId !== userId) {
        throw new ErrorResponse("Not authorized to update this address", statusCode.Forbidden);
    }

    const updatedAddress = await prisma.$transaction(async (tx) => {
        // Unset any current default address
        await tx.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false }
        });

        // Set this address as default
        return tx.address.update({
            where: { id },
            data: { isDefault: true }
        });
    });

    return SuccessResponse(res, "Default address set successfully", updatedAddress, statusCode.OK);
});
