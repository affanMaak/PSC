import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from "cloudinary"
import * as crypto from "crypto"

@Injectable()
export class CloudinaryService {


    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        })
    }

    async uploadFile(file: Express.Multer.File) {
        const folder = 'psc';
        const fileHash = crypto.createHash('md5').update(file.buffer).digest('hex');
        const publicId = `${folder}/${fileHash}`;

        try {
            let existing: any;
            try {
                existing = await cloudinary.api.resource(publicId, {
                    resource_type: 'image',
                });
            } catch (err: any) {
                // Ignore 404 from Cloudinary (not found)
                if (err?.error?.http_code !== 404) throw err;
            }

            if (existing) {
                return {
                    url: existing.secure_url,
                    public_id: existing.public_id,
                };
            }

            // Upload new image
            const uploaded = await new Promise<any>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder,
                        public_id: fileHash,
                        resource_type: 'image',
                        overwrite: false,
                    },
                    (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    },
                );
                stream.end(file.buffer);
            });

            return {
                type: 'image',
                url: uploaded.secure_url,
                public_id: uploaded.public_id,
            };
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new InternalServerErrorException('Failed to upload file(s) to Cloudinary');
        }
    }


    async removeFile(public_id: string) {
        try {
            return await cloudinary.uploader.destroy(public_id, {
                resource_type: 'image',
            });
        } catch (error) {
            console.error('Error deleting file from Cloudinary:', error);
            throw new InternalServerErrorException('Failed to delete file from Cloudinary');
        }
    }


}
