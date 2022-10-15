const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        brand: {
            type: Schema.Types.ObjectId,
            ref: 'Brand',
            required: false
        },
        description: {
            type: String,
            required: false
        },
        medias: [{
            type: String,
            required: false
        }],
        images: [
            {
                type: String,
                required: false
            },
        ],
        status: {
            type: Number,
            required: false
        },
        canReturn: {
            type: Boolean,
            required: false
        },
        returnPeriod: {
            type: Number,
            required: false
        },
        canPartialPayment: {
            type: Boolean,
            required: true
        },
        partialPaymentType: {
            type: Number,
            required: false
        },
        partialPayment: {
            type: Number,
            required: false
        },
        canEarnPoints: {
            type: Boolean,
            required: true
        },
        earnPointsType: {
            type: Number,
            required: false
        },
        earnPoints: {
            type: Number,
            required: false
        },
        canRedeemPoints: {
            type: Boolean,
            required: true
        },
        redeemPointsType: {
            type: Number,
            required: false
        },
        redeemPoints: {
            type: Number,
            required: false
        },
        type: {
            type: String,
            required: false
        },
        vendor: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
            required: false
        },
        productType: [{
            type: Schema.Types.ObjectId,
            ref: 'ProductType',
            required: false
        }],
        tags: [],
        costPrice: {
            type: Number,
            required: false
        },
        purchaseTax: {
            type: Number,
            required: false
        },
        wholeSalePrice: {
            type: Number,
            required: false
        },
        sellingPrice: {
            type: Number,
            required: false
        },
        discountType: {
            type: Number,
            required: false
        },
        discountAmount: {
            type: Number,
            required: false
        },
        tax: {
            type: Number,
            required: false
        },
        hasTax: {
            type: Boolean,
            required: false
        },
        sku: {
            unique: true,
            type: String,
            required: true
        },
        barcode: {
            type: String,
            required: false
        },
        quantity: {
            type: Number,
            required: false
        },
        soldQuantity: {
            type: Number,
            required: false
        },
        committedQuantity: {
            type: Number,
            required: false
        },
        reOrder: {
            type: Number,
            required: true
        },
        trackQuantity: {
            type: Boolean,
            required: false
        },
        continueSelling: {
            type: Boolean,
            required: false
        },
        isPhysicalProduct: {
            type: Boolean,
            required: false
        },
        weight: {
            type: Number,
            required: true
        },
        country: {
            type: Schema.Types.ObjectId,
            ref: 'Country',
            required: false
        },
        hasVariant: {
            type: Boolean,
            required: false
        },

        variants: [],
        options: [],

        variantFormArray: [
            {
                variantVendorName: {
                    type: Schema.Types.ObjectId,
                    ref: 'Admin',
                    required: false
                },

                variantQuantity: {
                    type: Number,
                    min: 0,
                    required: false
                },
                variantCostPrice: {
                    type: Number,
                    min: 0,
                    required: false
                },
                variantCommittedQuantity: {
                    type: Number,
                    min: 0,
                    required: false
                },
                variantReOrder: {
                    type: Number,
                    required: false
                },
                variantContinueSelling: {
                    type: Boolean,
                    required: false
                },
                variantDisplay: {
                    type: Boolean,
                    required: false
                },
                variantStatus: {
                    type: Number,
                    required: false
                },
                variantPrice: {
                    type: Number,
                    required: false
                },
                image: {
                    type: String,
                    required: false
                },
                variantSku: {
                    type: String,
                    required: false
                },

            }

        ],
        variantDataArray: [],

        searchPageTitle: {
            type: String,
            required: false
        },
        searchPageDescription: {
            type: String,
            required: false
        },
        searchPageUrl: {
            type: String,
            required: false
        },
        sizeChartImageLink: {
            type: String,
            required: false
        },
        multyPrice: {
            type: String,
            required: false
        },
        multyWeight: {
            type: String,
            required: false
        },
        moq: {
            type: String,
            required: false
        },
        link: {
            type: String,
            required: false
        },
        hasLink: {
            type: Boolean,
            required: false
        },
        isActive: {
            type: Boolean,
            required: false
        },
        isDraft: {
            type: Boolean,
            required: false
        },
        isStockOut: {
            type: Boolean,
            required: false
        },
        isReOrder: {
            type: Boolean,
            required: false
        },
        isPreOrder: {
            type: Boolean,
            required: false
        },
        website: {
            type: String,
            required: false
        },

    }, {
    timestamps: true
});


module.exports = mongoose.model('Product', schema);
