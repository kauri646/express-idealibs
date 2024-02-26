import bcrypt from 'bcrypt'
import store from 'store'
import { nanoid } from 'nanoid'
import supabase from '../config/supabase.js';
import { fileTypeFromStream } from 'file-type';

export const imageUpload = async (folder, bucket, image) => {
  try {
    console.log(image.data)
    console.log(bucket)
    const getFileExtension = filename => filename.includes('.') ? filename.split('.').pop() : null;
    const imagePath = `project_image${nanoid(10)}.${getFileExtension(image.name)}`

    const { data: imageData, error } = await supabase
      .storage
      .from(bucket)
      .upload(`${folder}/${imagePath}`, image.data, {
        upsert: false,
        request: {
          duplex: true,
        },
      });

    if (error) {
      throw new Error(error)
    }

    const { data: imageUrl } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(`${folder}/${imagePath}`)

    console.log(imageUrl)

    return imageUrl.publicUrl;

  } catch (err) {
    // throw new Error(err.message);
  }
};

export const getImageUrl = async (folder, bucket, image) => {
  const { data: imageUrl } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(`${folder}/${image}`)

  return imageUrl.publicUrl;
}
