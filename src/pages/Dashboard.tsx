import { useTopics } from '../hooks/useTopics'; // Seedha import

export default function Dashboard() {
  // 1 line mein data, loading, aur error sab mil gaya!
  const { topics, loading, error } = useTopics();

  if (loading) return <div>Loading awesome content...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {topics.map((topic) => (
        <div key={topic.id} className="p-4 border rounded shadow">
          <h2 className="text-xl font-bold">{topic.title}</h2>
          <p>{topic.description}</p>
        </div>
      ))}
    </div>
  );
}
