import { useState, useEffect } from 'react';
import API from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: '', imageUrl: ''
  });
  const [editingId, setEditingId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchUserProducts();
  }, []);

  const fetchUserProducts = async () => {
    try {
      const response = await API.get('/api/products');
      const userProducts = user.role === "admin"
        ? response.data
        : response.data.filter(p => p.userId._id === user.id);
      setProducts(userProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/api/products/${editingId}`, formData);
        setEditingId(null);
      } else {
        await API.post('/api/products', formData);
      }
      setFormData({ name: '', description: '', price: '', category: '', imageUrl: '' });
      fetchUserProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl
    });
    setEditingId(product._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await API.delete(`/api/products/${id}`);
        fetchUserProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  console.log('Auth Token:', localStorage.getItem('token'));


  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Products Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit' : 'Add'} Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Product Name"
            className="w-full p-2 border rounded"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            className="w-full p-2 border rounded"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Price"
            className="w-full p-2 border rounded"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Category"
            className="w-full p-2 border rounded"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
          <input
            type="url"
            placeholder="Image URL (optional)"
            className="w-full p-2 border rounded"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              {editingId ? 'Update' : 'Add'} Product
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: '', description: '', price: '', category: '', imageUrl: '' });
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <p className="text-lg font-bold text-blue-600 mb-2">₹{product.price}</p>
              <p className="text-sm text-gray-500 mb-4">Category: {product.category}</p>
              <div className="flex gap-2">
                {(user.role === "admin" || product.userId._id === user.id) && (
                  <button 
                    onClick={() => handleDelete(product._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
                {product.userId._id === user.id && (
                  <button 
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
