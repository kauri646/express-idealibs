import { uploadFilesSchema, uploadIconSchema } from '../../models/files.js'; 
import supabase from '../../config/supabase.js'
import { imageUpload } from '../../services/fileSevice.js';

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

    const { title, description, file_type, tags_id, categories_id, item_id } = req.body;
    const { id } = req.params
    const { file_path } = req.files

    const imageUrl = await imageUpload('public', 'submission_images', file_path)

    const { data: submission, error: err } = await supabase
      .from('files')
      .insert({ title: title, description: description, file_path: imageUrl, file_type: file_type, tags_id: tags_id, user_id: id, categories_id: categories_id, item_id:item_id })
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

export const createIcon = async (req, res) => {
  try {
    if (!req.files.file_path) {
      res.status(422).json({
        status: 'fail',
        message: 'Image atau Proposal harus di upload'
      })
    }

    const { error, value } = uploadIconSchema.validate(req.body, { abortEarly: false });

    if (error) {
      const response = res.status(400).json({
        status: 'fail',
        message: `Upload Gagal, ${error.message}`
      })
      return response
    }

    const { title, description, file_type, tags_id, categories_id, item_id, icon_url } = req.body;
    const { id } = req.params
    const { file_path } = req.files

    const imageUrl = await imageUpload('public', 'submission_images', file_path)

    const { data: submission, error: err } = await supabase
      .from('icons')
      .insert({ title: title, description: description, file_path: imageUrl, file_type: file_type, tags_id: tags_id, user_id: id, categories_id: categories_id, item_id:item_id, icon_url:icon_url })
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
};

// export const addToCollection = async (req, res) => {
//   const { user_id, file_id } = req.body;
//   const { data, error } = await supabase
//     .from('collections')
//     .insert([{ user_id: user_id, file_id: file_id }]);
  
//   if (error) return res.status(400).send(error);
//   res.status(201).json({
//     status: 'success',
//     message: 'added to collections',
//     data: data
//   });
// };

// export const getUserCollections = async (req, res) => {
//   const user_id = req.params.userId;
//   const { data, error } = await supabase
//     .from('collections')
//     .select('*')
//     .eq('user_id', user_id);
  
//   if (error) return res.status(400).send(error);
//   res.status(200).send(data);
// };

export const getAllFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const itemId = req.query.item_id;
    const categoryId = req.query.category_id;
    const searchQuery = req.query.search;

    // Membangun query dengan kondisi filter yang diberikan
    let query = supabase
      .from('files')
      .select('id, title, description, file_path, created_at, file_type, categories_id, tags_id, user_id', { count: 'exact' });

    // Menerapkan pencarian jika searchQuery disediakan
    if (searchQuery) {
      // Membangun string query untuk pencarian di kedua kolom
      const searchCondition = `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`;
      query = query.or(searchCondition);
    }
    
      // Menambahkan filter jika diberikan dalam query params
    if (itemId) {
      query = query.eq('item_id', itemId); // Perhatikan disini koreksi dari 'item_id' ke 'id'
    }

    if (categoryId) {
      query = query.eq('categories_id', categoryId);
    }

    // Melakukan query dengan filter dan pagination yang telah ditentukan
    const { data: files, error: filesError, count } = await query.range(offset, offset + limit - 1);

    if (filesError) {
      throw filesError;
    }

    const categories = {};
    const tags = {};
    const users = {};
    for (const file of files) {
      if (!categories[file.categories_id]) {
        let { data: category } = await supabase
          .from('categories')
          .select(`category`)
          .eq('id', file.categories_id)
          .single();
        categories[file.categories_id] = category.category;
      }
      if (!tags[file.tags_id]) {
        let { data: tag } = await supabase
          .from('tags')
          .select(`tag`)
          .eq('id', file.tags_id)
          .single();
        tags[file.tags_id] = tag.tag;
      }
      if (!users[file.user_id]) {
        let { data: user } = await supabase
          .from('users')
          .select(`username`)
          .eq('id', file.user_id)
          .single();
        users[file.user_id] = user.username;
      }
    }

    // Menambahkan category_name dan tag_name ke setiap file
    const enrichedFiles = files.map(file => ({
      ...file,
      category_name: categories[file.categories_id],
      tag_name: tags[file.tags_id],
      username: users[file.user_id]
    }));

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      status: 'success',
      data: enrichedFiles,
      pagination: {
        totalItems: count,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: `Server error: ${err.message}`,
    });
  }
};

export const getAllIcons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const itemId = req.query.item_id;
    const categoryId = req.query.category_id;
    const searchQuery = req.query.search;

    // Membangun query dengan kondisi filter yang diberikan
    let query = supabase
      .from('icons')
      .select('id, title, description, file_path, created_at, file_type, categories_id, tags_id, user_id, icon_url', { count: 'exact' });

    // Menerapkan pencarian jika searchQuery disediakan
    if (searchQuery) {
      // Membangun string query untuk pencarian di kedua kolom
      const searchCondition = `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`;
      query = query.or(searchCondition);
    }
    
      // Menambahkan filter jika diberikan dalam query params
    if (itemId) {
      query = query.eq('item_id', itemId); // Perhatikan disini koreksi dari 'item_id' ke 'id'
    }

    if (categoryId) {
      query = query.eq('categories_id', categoryId);
    }

    // Melakukan query dengan filter dan pagination yang telah ditentukan
    const { data: files, error: filesError, count } = await query.range(offset, offset + limit - 1);

    if (filesError) {
      throw filesError;
    }

    const categories = {};
    const tags = {};
    const users = {};
    for (const file of files) {
      if (!categories[file.categories_id]) {
        let { data: category } = await supabase
          .from('categories')
          .select(`category`)
          .eq('id', file.categories_id)
          .single();
        categories[file.categories_id] = category.category;
      }
      if (!tags[file.tags_id]) {
        let { data: tag } = await supabase
          .from('tags')
          .select(`tag`)
          .eq('id', file.tags_id)
          .single();
        tags[file.tags_id] = tag.tag;
      }
      if (!users[file.user_id]) {
        let { data: user } = await supabase
          .from('users')
          .select(`username`)
          .eq('id', file.user_id)
          .single();
        users[file.user_id] = user.username;
      }
    }

    // Menambahkan category_name dan tag_name ke setiap file
    const enrichedIcons = files.map(file => ({
      ...file,
      category_name: categories[file.categories_id],
      tag_name: tags[file.tags_id],
      username: users[file.user_id]
    }));

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      status: 'success',
      data: enrichedIcons,
      pagination: {
        totalItems: count,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: `Server error: ${err.message}`,
    });
  }
};

export const getFileById = async (req, res) => {
  try {
      // Mendapatkan ID dari parameter request
      const { id } = req.params;

      // Query file berdasarkan ID dari tabel 'files'
      const { data: file, error } = await supabase
          .from('files')
          .select('*')
          .eq('id', id)
          .single(); // Gunakan .single() untuk mendapatkan objek tunggal, bukan array

      // Jika terjadi kesalahan dalam query
      if (error) {
          throw error;
      }

      // Jika file tidak ditemukan
      if (!file) {
          return res.status(404).json({
              status: 'fail',
              message: 'File not found',
          });
      }

      // Jika berhasil mendapatkan data, kirim data sebagai respons
      res.status(200).json({
          status: 'success',
          data: file,
      });
  } catch (err) {
      // Tangani kesalahan
      res.status(500).json({
          status: 'fail',
          message: `Server error: ${err.message}`
      });
  }
};


