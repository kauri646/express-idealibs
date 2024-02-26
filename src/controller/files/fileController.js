import bcrypt from 'bcrypt';
import { uploadFilesSchema } from '../../models/files.js'; // Asumsi Anda telah membuat schema validasi Joi untuk createPost
import supabase from '../../config/supabase.js'

export const createPost = async (req, res) => {
    try {
      // Extract data dari request body
      const { title, description, file_path, thumbnail, file_type, tags } = req.body;
  
      // Validasi data menggunakan Joi schema
      const { error } = uploadFilesSchema.validate(req.body, { abortEarly: false }); // Gunakan abortEarly: false untuk mendapatkan semua error
  
      if (error) {
        return res.status(400).json({
          status: 'fail',
          message: `Pembuatan post gagal, ${error.details.map(x => x.message).join(', ')}`
        });
      }
  
      // Insert data ke tabel 'files' dengan user_id = 1
      const { data: newPost, error: insertError } = await supabase
        .from('files')
        .insert([{
          title,
          description,
          file_path,
          thumbnail,
          file_type,
          tags,
          user_id: 1, // Menetapkan user_id sebagai 1
          // Tambahkan fields lain sesuai dengan skema tabel Anda
        }])
        .single(); // Gunakan .single() jika hanya memasukkan satu baris
  
      if (insertError) {
        throw insertError;
      }
  
      // Respons sukses dengan data post yang baru dibuat
      res.status(201).json({
        status: 'success',
      });
  
    } catch (err) {
      res.status(500).json({
        status: 'fail',
        message: `Server error: ${err.message}`
      });
    }
};

export const getAllFiles = async (req, res) => {
    try {
        // Query semua file dari tabel 'files'
        const { data: files, error } = await supabase
            .from('files')
            .select('*');

        // Jika terjadi kesalahan dalam query
        if (error) {
            throw error;
        }

        // Jika berhasil mendapatkan data, kirim data sebagai respons
        res.status(200).json({
            status: 'success',
            data: files,
        });
    } catch (err) {
        // Tangani kesalahan
        res.status(500).json({
            status: 'fail',
            message: `Server error: ${err.message}`
        });
    }
};