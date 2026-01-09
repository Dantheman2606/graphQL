import { useState } from 'react';
import { gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';

const LOGIN_MUTATION = gql`
  mutation Login($identifier: String!, $password: String!) {
    login(input: { identifier: $identifier, password: $password }) {
      jwt
      user {
        id
        username
        email
      }
    }
  }
`;

export default function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        try {
            const { data } = await loginMutation({
                variables: { identifier, password },
            });

            if (data?.login?.jwt) {
                login(data.login.jwt, data.login.user);
                navigate('/');
            }
        } catch (err: unknown) {
            console.error("Login error:", err);

            let message = "Login failed. Please check your credentials.";

            if (err && typeof err === "object" && err !== null) {

                // 🔥 Case 1: CombinedGraphQLErrors
                if ("errors" in err && Array.isArray((err as any).errors)) {
                    const firstError = (err as any).errors[0];
                    message =
                        firstError?.extensions?.error?.message ??
                        firstError?.message ??
                        message;
                }

                // 🔁 Case 2: Apollo hook-style error
                else if ("graphQLErrors" in err && Array.isArray((err as any).graphQLErrors)) {
                    const firstError = (err as any).graphQLErrors[0];
                    message =
                        firstError?.extensions?.error?.message ??
                        firstError?.message ??
                        message;
                }

                // 🟡 Fallback
                else if (err instanceof Error) {
                    message = err.message;
                }
            }

            console.log("Final message:", message);
            setErrorMsg(message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                        {errorMsg}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email or Username</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <span className="text-blue-500 cursor-pointer" onClick={() => navigate('/signup')}>
                        Sign up
                    </span>
                </div>
            </div>
        </div>
    );
}
