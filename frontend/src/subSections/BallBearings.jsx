
import axios from "axios";
import { useEffect, useState } from "react";



function BallBearings() {

    const [ballBearings, setBallBearings] = useState([]);

    useEffect(() => {
        const fetchBallBearings = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/ball-bearing/all_bearings',{
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setBallBearings(response.data.data);
            } catch (error) {
                console.error('Error fetching ball bearings:', error);
            }
        };

        fetchBallBearings();
    }, []);


    return (
        <div className="min-h-screen bg-gradient-to-r from-gray-950 via-gray-900 to-gray-800 p-10">
            <h1 className="text-5xl font-bold text-white mb-10">
                Ball Bearings Section
            </h1>
            <table className="min-w-full bg-white rounded-lg shadow-md">
                <thead>
                    <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Company Name</th>
                        <th className="py-3 px-6 text-left">Type</th>
                        <th className="py-3 px-6 text-left">Stock</th>
                        <th className="py-3 px-6 text-left">Action</th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 font-light">
                    {ballBearings.map((bearing) => (
                        <tr className="border-b border-gray-200 hover:bg-gray-100" >
                            <td className="py-3 px-6 text-left font-bold text-lg">{bearing.brandtype}</td>
                            <td className="py-3 px-6 text-left">{bearing.code}</td>
                            <td className="py-3 px-6 text-left">{bearing.stock}</td>
                            <td className="py-3 px-6 text-left">
                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    +
                                </button>
                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 ml-2 px-4 rounded">
                                    -
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}



export default BallBearings;