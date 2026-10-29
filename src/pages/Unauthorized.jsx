import { Link } from 'react-router';

const Unauthorized = () => {
  return (
    <div>
      <h1>Unauthorized</h1>
      <p>Login into your account to access this content.</p>
      <Link to='/login'>Login</Link>
    </div>
  );
};

export default Unauthorized;
