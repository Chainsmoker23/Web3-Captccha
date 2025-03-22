import React, { useState, useEffect } from 'react';
import { DrawMode, ClickMode } from './Modes';
import { ethers } from 'ethers';
import axios from 'axios';

const App = () => {
  const [mode, setMode] = useState('draw'); // "draw" or "click"
  const [hash, setHash] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);

  // Check wallet connection on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        setWalletConnected(accounts.length > 0);
      }
    };
    checkWalletConnection();
    window.ethereum?.on('accountsChanged', checkWalletConnection);
    return () => {
      window.ethereum?.removeListener('accountsChanged', checkWalletConnection);
    };
  }, []);

  // Inline style objects for layout and 3D effects
  const styles = {
    body: {
      margin: 0,
      padding: 0,
      fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
      color: '#fff',
      overflow: 'hidden',
      position: 'relative',
      minHeight: '100vh'
    },
    bgVideo: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      zIndex: -1
    },
    container: {
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '1rem',
      background: 'rgba(0, 0, 0, 0.3)', // semi-transparent so video shows through
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37)',
      position: 'relative',
      zIndex: 10
    },
    header: {
      textAlign: 'center',
      marginBottom: '1rem',
      textTransform: 'uppercase',
      letterSpacing: '2px'
    },
    modeToggle: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '1rem'
    },
    button: {
      background: '#4a4a8c',
      border: 'none',
      padding: '0.5rem 1rem',
      margin: '0 0.5rem',
      borderRadius: '4px',
      cursor: 'pointer',
      color: '#fff',
      transition: 'background 0.3s'
    },
    activeButton: {
      background: '#6c63ff'
    },
    challengeArea: {
      position: 'relative',
      width: '100%',
      height: '400px',
      background: 'rgba(255, 255, 255, 0.1)', // light transparent overlay
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      overflow: 'hidden',
      cursor: 'crosshair'
    },
    hashOutput: {
      marginTop: '1rem',
      textAlign: 'center',
      fontFamily: 'monospace',
      wordWrap: 'break-word'
    },
    submitButton: {
      background: '#6c63ff',
      color: '#fff',
      border: 'none',
      padding: '10px 20px',
      fontSize: '16px',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '1rem'
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletConnected(true);
      } catch (error) {
        console.error('Wallet connection failed:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const submitGesture = async () => {
    if (!walletConnected) {
      alert('Please connect your wallet first.');
      return;
    }
    if (!hash) {
      alert('No gesture hash computed.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/submit-gesture', { hash });
      console.log('Gesture submitted:', response.data);
      alert('Gesture submitted successfully!');
    } catch (error) {
      console.error('Error submitting gesture:', error);
      alert('Error submitting gesture.');
    }
  };

  return (
    <div style={styles.body}>
      {/* Background Video */}
      <video autoPlay muted loop style={styles.bgVideo}>
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div style={styles.container}>
        <h1 style={styles.header}>Gesture Challenge</h1>
        <div style={styles.modeToggle}>
          <button
            style={{ ...styles.button, ...(mode === 'draw' ? styles.activeButton : {}) }}
            onClick={() => {
              setMode('draw');
              setHash('');
            }}
          >
            Draw Mode
          </button>
          <button
            style={{ ...styles.button, ...(mode === 'click' ? styles.activeButton : {}) }}
            onClick={() => {
              setMode('click');
              setHash('');
            }}
          >
            Click Mode
          </button>
        </div>
        <div id="challenge-area" style={styles.challengeArea}>
          {mode === 'draw' ? (
            <DrawMode onHash={setHash} walletConnected={walletConnected} />
          ) : (
            <ClickMode onHash={setHash} walletConnected={walletConnected} />
          )}
        </div>
        <div id="hash-output" style={styles.hashOutput}>
          <strong>Hash: </strong> {hash || "No hash computed"}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={walletConnected ? submitGesture : connectWallet}
            style={styles.submitButton}
          >
            {walletConnected ? 'Submit Gesture' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
