import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '../context/AuthContext';
import { Pencil, Trash2, Plus, X } from 'lucide-react';

// GraphQL Queries and Mutations
const GET_USERS = gql`
  query GetUsers {
    userDbs {
      documentId
      Name
      DOB
      email
      phone
      is_active
      createdAt
      updatedAt
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($data: UserDbInput!) {
    createUserDb(data: $data) {
      documentId
      Name
      DOB
      email
      phone
      is_active
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($documentId: ID!, $data: UserDbInput!) {
    updateUserDb(documentId: $documentId, data: $data) {
      documentId
      Name
      DOB
      email
      phone
      is_active
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($documentId: ID!) {
    deleteUserDb(documentId: $documentId) {
      documentId
    }
  }
`;

// TypeScript Interfaces
interface UserDb {
    documentId: string;
    Name: string;
    DOB: string;
    email: string;
    phone: number;
    is_active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface UserFormData {
    Name: string;
    DOB: string;
    email: string;
    phone: string;
    is_active: boolean;
}

interface GetUsersData {
    userDbs: UserDb[];
}

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserDb | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [formData, setFormData] = useState<UserFormData>({
        Name: '',
        DOB: '',
        email: '',
        phone: '',
        is_active: true,
    });

    // GraphQL Hooks
    const { data, loading, error, refetch } = useQuery<GetUsersData>(GET_USERS);
    const [createUser, { loading: creating }] = useMutation(CREATE_USER, {
        onCompleted: () => {
            refetch();
            closeModal();
        },
    });
    const [updateUser, { loading: updating }] = useMutation(UPDATE_USER, {
        onCompleted: () => {
            refetch();
            closeModal();
        },
    });
    const [deleteUser] = useMutation(DELETE_USER, {
        onCompleted: () => {
            refetch();
            setDeleteConfirm(null);
        },
    });

    // Handlers
    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({
            Name: '',
            DOB: '',
            email: '',
            phone: '',
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (user: UserDb) => {
        setEditingUser(user);
        setFormData({
            Name: user.Name,
            DOB: user.DOB,
            email: user.email,
            phone: user.phone.toString(),
            is_active: user.is_active,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({
            Name: '',
            DOB: '',
            email: '',
            phone: '',
            is_active: true,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            Name: formData.Name,
            DOB: formData.DOB,
            email: formData.email,
            phone: parseInt(formData.phone),
            is_active: formData.is_active,
        };

        try {
            if (editingUser) {
                await updateUser({
                    variables: {
                        documentId: editingUser.documentId,
                        data,
                    },
                });
            } else {
                await createUser({
                    variables: { data },
                });
            }
        } catch (err) {
            console.error('Error saving user:', err);
        }
    };

    const handleDelete = async (documentId: string) => {
        try {
            await deleteUser({
                variables: { documentId },
            });
        } catch (err) {
            console.error('Error deleting user:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">User Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">Welcome, {user?.username || 'Guest'}</span>
                    <button
                        onClick={logout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Add User Button */}
            <div className="mb-6">
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-semibold"
                >
                    <Plus size={20} />
                    Add New User
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading users...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-600">
                        Error loading users: {error.message}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">DOB</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data?.userDbs?.map((user: UserDb) => (
                                    <tr key={user.documentId} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm text-gray-900">{user.Name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(user.DOB).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                    title="Edit"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(user.documentId)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {data?.userDbs?.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No users found. Click "Add New User" to create one.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {editingUser ? 'Edit User' : 'Create New User'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.Name}
                                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="number"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={formData.DOB}
                                    onChange={(e) => setFormData({ ...formData, DOB: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) =>
                                        setFormData({ ...formData, is_active: e.target.checked })
                                    }
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                    Active
                                </label>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    disabled={creating || updating}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
                                >
                                    {creating || updating
                                        ? 'Saving...'
                                        : editingUser
                                            ? 'Update User'
                                            : 'Create User'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this user? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition font-semibold"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
