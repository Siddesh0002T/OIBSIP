import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Loader } from '../../components/Loader';
import { CheckCircle, XCircle } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const { data } = await api.get(`/auth/verify/${token}`);
        setSuccess(true);
        setMessage(data.message);
      } catch (error) {
        setSuccess(false);
        setMessage(error.response?.data?.message || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center">
        {success ? (
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        ) : (
          <XCircle className="w-16 h-16 text-pizza-red mx-auto mb-4" />
        )}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {success ? 'Email Verified!' : 'Verification Failed'}
        </h2>
        <p className="text-gray-600 mb-8">{message}</p>
        <Link to="/login">
          <Button className="w-full">Go to Login</Button>
        </Link>
      </Card>
    </div>
  );
};

export default VerifyEmail;
