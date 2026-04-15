import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', background: '#000', height: '100vh' }}>
          <h2>Oops, deu erro na interface!</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: 'white' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button style={{marginTop: '1rem', padding: '0.5rem 1rem'}} onClick={() => window.location.reload()}>Recarregar Tela</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
