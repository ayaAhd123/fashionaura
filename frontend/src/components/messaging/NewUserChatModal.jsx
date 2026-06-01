import { useState } from "react";
import toast from "react-hot-toast";
import { X, Search, UserPlus } from "lucide-react";
import { searchUsers, getUserConversation } from "../../services/api";

export default function NewUserChatModal({ open, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSearch = async () => {
    if (query.trim().length < 2) {
      toast.error("Saisissez au moins 2 caractères.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await searchUsers(query.trim());
      setResults(data?.data || []);
    } catch {
      toast.error("Recherche impossible");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (user) => {
    try {
      const { data } = await getUserConversation(user.id);
      onSelect({
        id: data.id,
        kind: "user",
        type: "user",
        label: data.counterpart_name,
        counterpart_name: data.counterpart_name,
      });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Conversation impossible");
    }
  };

  return (
    <>
      <div className="share-modal__backdrop" onClick={onClose} />
      <div className="share-modal">
        <div className="share-modal__head">
          <h3>
            <UserPlus size={18} /> Nouvelle discussion
          </h3>
          <button type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="share-modal__body">
          <div className="share-modal__search">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chercher un utilisateur…"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button type="button" onClick={handleSearch} disabled={loading}>
              Chercher
            </button>
          </div>
          <ul className="share-modal__list">
            {results.map((u) => (
              <li key={u.id}>
                <button type="button" onClick={() => startChat(u)}>
                  {u.name}
                  <span>{u.email}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
