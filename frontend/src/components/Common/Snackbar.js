// frontend/src/components/Common/Snackbar.js
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Snackbar = ({ message, type, show, onClose, duration = 3000 }) => {
    // Internal state to manage visibility for animation purposes
    const [isVisible, setIsVisible] = useState(show);

    useEffect(() => {
        setIsVisible(show);
        if (show) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                if (onClose) {
                    onClose(); // Call the parent's onClose handler
                }
            }, duration);

            return () => clearTimeout(timer); // Cleanup timer on unmount or if show changes
        }
    }, [show, duration, onClose]);

    const snackbarVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: 50, transition: { duration: 0.2 } },
    };

    const getTypeClasses = () => {
        switch (type) {
            case 'success':
                return 'bg-success text-white';
            case 'error':
                return 'bg-danger text-white';
            case 'info':
                return 'bg-info text-white';
            default:
                return 'bg-secondary text-white';
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={`snackbar-container fixed-bottom start-50 translate-middle-x p-3 rounded-top shadow-lg ${getTypeClasses()}`}
                    variants={snackbarVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    role="alert"
                >
                    {message}
                    {/* Optional: Add a close button */}
                    {/* <button type="button" className="btn-close btn-close-white ms-3" aria-label="Close" onClick={onClose}></button> */}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Snackbar;
