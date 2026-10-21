import {
    Routes,
    Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Order from "./pages/Order";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import ProductForm from "./pages/ProductForm";
import AdminInventory from "./pages/AdminInventory";
import AdminOrders from "./pages/AdminOrders";
import OrderDetails from "./pages/OrderDeatils";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import ProductDetails from "./pages/ProductDetails";

function App() {

    return (
        <>

            <Navbar />

            <main>

                <Routes>

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/products"
                        element={

                            <Products />

                        }
                    />
                    <Route
                        path="/cart"
                        element={

                            <Cart />

                        }
                    />

                    <Route
                        path="/orders"
                        element={
                            <Order />
                        }
                    />
                    {/* Admin Dashboard */}
                    <Route
                        path="/admin"
                        element={
                            <RoleProtectedRoute requiredRole="ADMIN">
                                <AdminDashboard />
                            </RoleProtectedRoute>
                        }
                    />

                    {/* Admin Product Management */}
                    <Route
                        path="/admin/products"
                        element={
                            <RoleProtectedRoute requiredRole="ADMIN">
                                <AdminProducts />
                            </RoleProtectedRoute>
                        }
                    />

                    {/* Add Product */}
                    <Route
                        path="/admin/products/new"
                        element={
                            <RoleProtectedRoute requiredRole="ADMIN">
                                <ProductForm />
                            </RoleProtectedRoute>
                        }
                    />

                    {/* Edit Product */}
                    <Route
                        path="/admin/products/edit/:id"
                        element={
                            <RoleProtectedRoute requiredRole="ADMIN">
                                <ProductForm />
                            </RoleProtectedRoute>
                        }
                    />

                    {/* Unauthorized */}
                    <Route
                        path="/unauthorized"
                        element={<Unauthorized />}
                    />

                    <Route
                        path="/admin/inventory"
                        element={
                            <RoleProtectedRoute requiredRole="ADMIN">
                                <AdminInventory />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/orders"
                        element={
                            <AdminOrders />
                        }
                    />
                    <Route
                        path="/orders/:id"
                        element={
                            <ProtectedRoute>
                                <OrderDetails />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                    path="/products/:id" 
                    element={<ProductDetails />}
                     />
                </Routes>

            </main>

            <Footer />
        </>



    );
}

export default App;