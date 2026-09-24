const AdminCard = ({ title, amount }: any) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-medium text-gray-800">{title}</h2>
      <p className="text-6xl font-bold mt-2">{amount}</p>
    </div>
  );
};

export default AdminCard;
