'use client';

import React, { useState, useEffect } from 'react';
import { usePayment } from '@/contexts/PaymentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit2, Trash2, Save, X, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PaymentMethodManager = () => {
  const { userProfile } = useAuth();
  const { 
    paymentMethods, 
    loading, 
    createPaymentMethod, 
    updatePaymentMethod, 
    fetchPaymentMethods 
  } = usePayment();
  
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    methodType: 'bkash',
    accountNumber: '',
    accountName: '',
    instructions: '',
    isActive: true
  });

  // Check if user is admin
  if (userProfile?.role !== 'admin') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Access denied. Only administrators can manage payment methods.</p>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      methodType: 'bkash',
      accountNumber: '',
      accountName: '',
      instructions: '',
      isActive: true
    });
    setEditingMethod(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.accountNumber || !formData.accountName) {
      toast.error('Please fill in all required fields');
      return;
    }

    let result;
    if (editingMethod) {
      result = await updatePaymentMethod(editingMethod.$id, formData);
    } else {
      result = await createPaymentMethod(formData);
    }

    if (result.success) {
      resetForm();
    }
  };

  const handleEdit = (method) => {
    setFormData({
      methodType: method.methodType,
      accountNumber: method.accountNumber,
      accountName: method.accountName,
      instructions: method.instructions || '',
      isActive: method.isActive
    });
    setEditingMethod(method);
    setShowForm(true);
  };

  const handleToggleActive = async (method) => {
    await updatePaymentMethod(method.$id, {
      isActive: !method.isActive
    });
  };

  const getMethodIcon = (type) => {
    switch (type) {
      case 'bkash':
        return <Smartphone className="w-5 h-5 text-pink-600" />;
      case 'nagad':
        return <CreditCard className="w-5 h-5 text-orange-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

  const getMethodColor = (type) => {
    switch (type) {
      case 'bkash':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'nagad':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
          <p className="text-gray-600 mt-1">Manage bKash and Nagad account details for course payments</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Payment Method
        </button>
      </div>

      {/* Payment Methods List */}
      <div className="grid gap-4">
        {paymentMethods.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Methods</h3>
            <p className="text-gray-600 mb-4">Add your bKash or Nagad account details to start accepting payments</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Payment Method
            </button>
          </div>
        ) : (
          paymentMethods.map((method) => (
            <div key={method.$id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getMethodIcon(method.methodType)}
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {method.methodType}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                        method.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {method.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      <span className="font-medium">Account:</span> {method.accountNumber}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Name:</span> {method.accountName}
                    </p>
                    {method.instructions && (
                      <p className="text-gray-600 mt-2 text-sm">
                        <span className="font-medium">Instructions:</span> {method.instructions}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(method)}
                    className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                      method.isActive 
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {method.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(method)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Method Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method Type *
                  </label>
                  <select
                    value={formData.methodType}
                    onChange={(e) => setFormData({ ...formData, methodType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                  </select>
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="01XXXXXXXXX"
                    required
                  />
                </div>

                {/* Account Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Instructions
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Additional instructions for students..."
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active (students can use this payment method)
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {editingMethod ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodManager;