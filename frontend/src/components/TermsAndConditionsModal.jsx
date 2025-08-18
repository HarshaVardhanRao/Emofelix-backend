import { useState } from 'react';
import PropTypes from 'prop-types';

const TermsAndConditionsModal = ({ isOpen, onClose, onAccept, isLoading = false }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10; // 10px tolerance
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAcceptChange = (e) => {
    setIsAccepted(e.target.checked);
  };

  const handleAccept = () => {
    if (isAccepted && hasScrolledToBottom) {
      onAccept();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Terms and Conditions</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {/* Terms Content */}
        <div
          className="flex-1 p-6 overflow-y-auto text-gray-700 leading-relaxed"
          onScroll={handleScroll}
        >
          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h3>
              <p>
                Welcome to EmoFelix! These Terms and Conditions (&quot;Terms&quot;) govern your use of the EmoFelix
                mobile application and related services provided by EmoFelix (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).
                By accessing or using our service, you agree to be bound by these Terms.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h3>
              <p>
                EmoFelix is an AI-powered emotional support platform that provides users with virtual
                companions and characters designed to offer emotional support, companionship, and
                interactive conversations. Our service includes features such as custom character
                creation, voice interactions, and personalized emotional support experiences.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts and Registration</h3>
              <div className="space-y-3">
                <p>3.1 To access certain features of EmoFelix, you must create an account by providing accurate and complete information.</p>
                <p>3.2 You are responsible for maintaining the confidentiality of your account credentials.</p>
                <p>3.3 You must be at least 13 years old to use our service. Users under 18 should have parental consent.</p>
                <p>3.4 You agree to notify us immediately of any unauthorized use of your account.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Acceptable Use Policy</h3>
              <div className="space-y-3">
                <p>You agree not to use EmoFelix to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Engage in any illegal, harmful, or offensive activities</li>
                  <li>Harass, abuse, or harm other users or our AI systems</li>
                  <li>Share inappropriate, violent, or explicit content</li>
                  <li>Attempt to reverse engineer or hack our systems</li>
                  <li>Use the service for commercial purposes without authorization</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Privacy and Data Protection</h3>
              <div className="space-y-3">
                <p>5.1 Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information.</p>
                <p>5.2 By using EmoFelix, you consent to the collection and use of your information as described in our Privacy Policy.</p>
                <p>5.3 We implement appropriate security measures to protect your personal data.</p>
                <p>5.4 Conversations with AI characters may be processed to improve our service quality.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Virtual Currency and Purchases</h3>
              <div className="space-y-3">
                <p>6.1 EmoFelix uses a virtual currency system called &quot;EmoCoins&quot; for certain features.</p>
                <p>6.2 EmoCoins have no real-world monetary value and cannot be exchanged for real money.</p>
                <p>6.3 EmoCoins earned through app activities are subject to our reward policies.</p>
                <p>6.4 We reserve the right to modify the EmoCoins system with appropriate notice.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Intellectual Property</h3>
              <div className="space-y-3">
                <p>7.1 All content, features, and functionality of EmoFelix are owned by us and protected by copyright, trademark, and other laws.</p>
                <p>7.2 You may not reproduce, distribute, or create derivative works from our content without permission.</p>
                <p>7.3 User-generated content remains your property, but you grant us a license to use it within our service.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Limitation of Liability</h3>
              <div className="space-y-3">
                <p>8.1 EmoFelix is provided for emotional support and entertainment purposes only.</p>
                <p>8.2 Our service is not a substitute for professional mental health treatment.</p>
                <p>8.3 We are not liable for any decisions made based on interactions with our AI characters.</p>
                <p>8.4 In case of mental health emergencies, please contact appropriate emergency services.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">9. Service Availability</h3>
              <div className="space-y-3">
                <p>9.1 We strive to maintain service availability but cannot guarantee uninterrupted access.</p>
                <p>9.2 We may modify, suspend, or discontinue features with reasonable notice.</p>
                <p>9.3 Scheduled maintenance may temporarily affect service availability.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">10. Termination</h3>
              <div className="space-y-3">
                <p>10.1 You may terminate your account at any time by contacting us.</p>
                <p>10.2 We may terminate or suspend accounts that violate these Terms.</p>
                <p>10.3 Upon termination, your access to the service will cease immediately.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to Terms</h3>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of significant
                changes through the app or email. Continued use of the service after changes constitutes
                acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">12. Contact Information</h3>
              <div className="space-y-3">
                <p>If you have questions about these Terms, please contact us at:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> support@emofelix.com</p>
                  <p><strong>Address:</strong> EmoFelix Support Team</p>
                </div>
              </div>
            </section>

            <section className="border-t pt-6">
              <p className="text-sm text-gray-600">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                By using EmoFelix, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </section>
          </div>
        </div>

        {/* Scroll Indicator */}
        {!hasScrolledToBottom && (
          <div className="px-6 py-2 bg-yellow-50 border-t border-yellow-200">
            <p className="text-yellow-800 text-sm text-center">
              📄 Please scroll down to read the complete Terms and Conditions
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={isAccepted}
                onChange={handleAcceptChange}
                disabled={!hasScrolledToBottom || isLoading}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <span className={`text-sm ${!hasScrolledToBottom ? 'text-gray-400' : 'text-gray-700'}`}>
                I have read and agree to the Terms and Conditions
              </span>
            </label>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                disabled={!isAccepted || !hasScrolledToBottom || isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Accept and Continue'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

TermsAndConditionsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAccept: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default TermsAndConditionsModal;