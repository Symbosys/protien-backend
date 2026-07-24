import { asyncHandler } from "../../../middleware/error.middleware.js";
import { ErrorResponse, SuccessResponse } from "../../../utils/response.utils.js";
import { statusCode } from "../../../types/types.js";
import prisma from "../../../config/prisma.js";
import { createAttributeSchema, addAttributeValuesSchema } from "../validation/attribute.validation.js";
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

export const getAllAttributes = asyncHandler(async (req, res, next) => {
    const attributes = await prisma.attribute.findMany({
        include: {
            values: true,
        },
        orderBy: {
            name: "asc",
        },
    });

    return SuccessResponse(res, "Attributes fetched successfully", attributes, statusCode.OK);
});

export const createAttribute = asyncHandler(async (req, res, next) => {
    const validData = createAttributeSchema.parse(req.body);

    const existing = await prisma.attribute.findUnique({
        where: { name: validData.name }
    });

    if (existing) {
        throw new ErrorResponse("Attribute with this name already exists", statusCode.Bad_Request);
    }

    const attribute = await prisma.attribute.create({
        data: {
            name: validData.name,
            values: validData.values ? {
                create: await Promise.all(validData.values.map(async (valObj) => {
                    const valueStr = typeof valObj === 'string' ? valObj : valObj.value;
                    let imageUrl: string | null = null;
                    if (typeof valObj !== 'string' && valObj.image) {
                        imageUrl = await processBase64Image(valObj.image, "products/attributes");
                    }
                    return {
                        value: valueStr,
                        image: imageUrl
                    };
                }))
            } : undefined
        },
        include: {
            values: true
        }
    });

    return SuccessResponse(res, "Attribute created successfully", attribute, statusCode.Created);
});

export const addAttributeValues = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        throw new ErrorResponse("Attribute ID is required", statusCode.Bad_Request);
    }
    const validData = addAttributeValuesSchema.parse(req.body);

    const attribute = await prisma.attribute.findUnique({
        where: { id }
    });

    if (!attribute) {
        throw new ErrorResponse("Attribute not found", statusCode.Not_Found);
    }

    // Upsert values to avoid duplicates
    const createdValues = await Promise.all(
        validData.values.map(async (valObj) => {
            const valueStr = typeof valObj === 'string' ? valObj : valObj.value;
            let imageUrl: string | null = null;
            if (typeof valObj !== 'string' && valObj.image) {
                imageUrl = await processBase64Image(valObj.image, "products/attributes");
            }

            return prisma.attributeValue.upsert({
                where: {
                    attributeId_value: {
                        attributeId: id,
                        value: valueStr
                    }
                },
                update: imageUrl ? { image: imageUrl } : {},
                create: {
                    attributeId: id,
                    value: valueStr,
                    image: imageUrl
                }
            });
        })
    );

    return SuccessResponse(res, "Attribute values added successfully", createdValues, statusCode.Created);
});

export const deleteAttribute = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        throw new ErrorResponse("Attribute ID is required", statusCode.Bad_Request);
    }

    const attribute = await prisma.attribute.findUnique({
        where: { id }
    });

    if (!attribute) {
        throw new ErrorResponse("Attribute not found", statusCode.Not_Found);
    }

    await prisma.attribute.delete({
        where: { id }
    });

    return SuccessResponse(res, "Attribute deleted successfully", null, statusCode.OK);
});

export const deleteAttributeValue = asyncHandler(async (req, res, next) => {
    const { valueId } = req.params;
    if (!valueId) {
        throw new ErrorResponse("Attribute value ID is required", statusCode.Bad_Request);
    }

    const val = await prisma.attributeValue.findUnique({
        where: { id: valueId }
    });

    if (!val) {
        throw new ErrorResponse("Attribute value not found", statusCode.Not_Found);
    }

    await prisma.attributeValue.delete({
        where: { id: valueId }
    });

    return SuccessResponse(res, "Attribute value deleted successfully", null, statusCode.OK);
});
