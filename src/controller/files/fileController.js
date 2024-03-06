import bcrypt from 'bcrypt';
import { uploadFilesSchema } from '../../models/files.js'; // Asumsi Anda telah membuat schema validasi Joi untuk createPost
import supabase from '../../config/supabase.js'
import { imageUpload } from '../../services/fileSevice.js';
import { file } from 'googleapis/build/src/apis/file/index.js';

export const createPost = async (req, res) => {
  try {
    if (!req.files.file_path) {
      res.status(422).json({
        status: 'fail',
        message: 'Image atau Proposal harus di upload'
      })
    }

    const { error, value } = uploadFilesSchema.validate(req.body, { abortEarly: false });

    if (error) {
      const response = res.status(400).json({
        status: 'fail',
        message: `Upload Gagal, ${error.message}`
      })
      return response
    }

    const { title, description, file_type, tags_id, categories_id } = req.body;
    const { id } = req.params
    const { file_path } = req.files

    const imageUrl = await imageUpload('public', 'submission_images', file_path)

    const { data: submission, error: err } = await supabase
      .from('files')
      .insert({ title: title, description: description, file_path: imageUrl, file_type: file_type, tags_id: tags_id, user_id: id, categories_id: categories_id })
      .select()

    if (err) {
      const response = res.status(400).json({
        status: 'fail',
        message: `Upload Gagal, ${err.message}`
      })
      return response
    }

    return res.status(200).json({
      status: 'success',
      message: 'file uploaded successfully',
      data: submission
    })

  } catch (err) {
    return res.status(500).json({ status: 'error', error: err.message });
  }
}

export const getAllFiles = async (req, res) => {
  try {
      // Mendapatkan nomor halaman dan jumlah item per halaman dari query parameter
      // Menetapkan nilai default jika parameter tidak disediakan
      const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
      const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not specified
      const offset = (page - 1) * limit; // Calculate the offset

      const { data: files, error, count } = await supabase
          .from('files')
          .select('*', { count: 'exact' }) // Use count to get the total number of records
          .range(offset, offset + limit - 1); // Use range for pagination

      if (error) {
          throw error;
      }

      // Menghitung jumlah total halaman
      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
          status: 'success',
          data: files,
          pagination: {
              totalItems: count,
              totalPages: totalPages,
              currentPage: page,
              itemsPerPage: limit,
          },
      });
  } catch (err) {
      // Handle errors
      res.status(500).json({
          status: 'fail',
          message: `Server error: ${err.message}`,
      });
  }
};
