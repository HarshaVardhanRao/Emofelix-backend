import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TermsAndConditionsModal from './TermsAndConditionsModal';
import { API_BASE_URL } from '../apiBase';
import axios from 'axios';

const TermsChecker = ({ children }) => {
  const { user, logout } = useAuth();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if logged-in user has accepted terms
    if (user && user.terms_accepted === false) {
      setShowTermsModal(true);
    }
  }, [user]);

  const handleAcceptTerms = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/accept-terms/`, {
        terms_accepted: true
      });

      // Update user state to reflect terms acceptance
      setShowTermsModal(false);

      // Refresh user data
      window.location.reload(); // Simple refresh to get updated user data

    } catch (error) {
      console.error('Error accepting terms:', error);
      alert('Error accepting terms. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineTerms = () => {
    // If user declines terms, logout
    logout();
  };

  return (
    <>
      {children}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={handleDeclineTerms}
        onAccept={handleAcceptTerms}
        isLoading={isLoading}
      />
    </>
  );
};

export default TermsChecker;