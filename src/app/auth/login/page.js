"use client"
import React, { useState } from 'react';

const Page = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validate form
  const validateForm = () => {
    let newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
      // You can send formData to an API here
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white py-5 px-8 border-t-4 border-blue-700 rounded-md shadow-lg w-80">
        <h2 className="text-3xl text-gray-400 mb-3">Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="text-sm">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 mt-1 bg-gray-200 rounded-md focus:outline-none"
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          <div className="mt-2 mb-3">
            <label className="text-sm">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 mt-1 bg-gray-200 rounded-md focus:outline-none"
            />
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
          </div>

          <button 
            type="submit"
            className="border-none bg-blue-800 py-2 px-3 text-white rounded-md w-full mt-2 hover:bg-blue-700 mb-5"
          >
            Sign In
          </button>
        </form>

        <a href="#" className="text-sm text-blue-400 hover:underline">
          Forgot my Password
        </a>
      </div>
    </div>
  );
};

export default Page;
