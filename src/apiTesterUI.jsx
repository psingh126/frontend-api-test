import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ApiTester() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("{}");
  const [requestBody, setRequestBody] = useState("{}");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState([]);
  const [visibleHistory, setVisibleHistory] = useState([]);
  const loaderRef = useRef(null);

  const methods = ["GET", "POST", "PUT", "DELETE"];

  // -------------------------------
  // LOAD HISTORY FROM SUPABASE
  // -------------------------------
  const loadHistoryFromSupabase = async () => {
    const { data, error } = await supabase
      .from("api_history")
      .select("*")
      .order("id", { ascending: false });

    if (!error) {
      setHistory(data);
      setVisibleHistory(data.slice(0, 20)); // Initial visible chunk
    }
  };

  const deleteHistoryItem = async (id) => {
    try {
      const { error } = await supabase
        .from("api_history")
        .delete()
        .eq("id", id);
  
      if (error) {
        console.error("Delete failed:", error);
        return;
      }
  
      // Update UI
      setHistory((prev) => prev.filter((item) => item.id !== id));
  
    } catch (err) {
      console.error("Error deleting history item:", err);
    }
  };
  
  

  // -------------------------------
  // SAVE HISTORY TO SUPABASE
  // -------------------------------
  const saveHistoryToSupabase = async (entry) => {
    await supabase.from("api_history").insert([entry]);
    loadHistoryFromSupabase(); // reload
  };

  // -------------------------------
  // HANDLE SEND REQUEST
  // -------------------------------
  const handleSendRequest = async (
    customUrl = url,
    customMethod = method,
    customHeaders = headers,
    customBody = requestBody
  ) => {
    try {
      let parsedHeaders = {};

      try {
        parsedHeaders = JSON.parse(customHeaders || "{}");
      } catch {
        setResponse("Invalid JSON in headers.");
        return;
      }

      let options = { method: customMethod, headers: parsedHeaders };

      if (customMethod === "POST" || customMethod === "PUT") {
        options.headers["Content-Type"] = "application/json";
        options.body = customBody;
      }

      const res = await fetch(customUrl, options);
      const text = await res.text();

      try {
        setResponse(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setResponse(text);
      }

      // Save request to Supabase
      saveHistoryToSupabase({
        url: customUrl,
        method: customMethod,
        headers: parsedHeaders,
        body: customBody,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setResponse("Error: " + err.message);
    }
  };

  // -------------------------------
  // WHEN CLICK A HISTORY ITEM → FILL FORM + AUTO CALL
  // -------------------------------
  const loadHistoryItem = (item) => {
    setUrl(item.url);
    setMethod(item.method);
    setHeaders(JSON.stringify(item.headers || {}, null, 2));
    setRequestBody(item.body || "");

    handleSendRequest(item.url, item.method, JSON.stringify(item.headers), item.body);
  };

  // -------------------------------
  // INFINITE SCROLL OBSERVER
  // -------------------------------
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const more = history.slice(visibleHistory.length, visibleHistory.length + 20);
        if (more.length > 0) {
          setVisibleHistory((prev) => [...prev, ...more]);
        }
      }
    });

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [history, visibleHistory]);

  useEffect(() => {
    loadHistoryFromSupabase();
  }, []);

  return (
    <div className="flex h-screen w-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">

      {/* LEFT SIDEBAR (HISTORY) */}
      <div className="history-container h-full overflow-y-auto p-2">

  {visibleHistory.map((item, index) => (
    <div
      key={item.id}
      className="relative p-3 mb-2 bg-gray-800 rounded cursor-pointer hover:bg-gray-700"
    >
     
    

      <div onClick={() => loadHistoryItem(item)}>
        <p className="text-sm text-purple-400">{item.method}</p>
        <p className="text-sm text-white truncate">{item.url}</p>
        <p className="text-xs text-gray-400">{item.timestamp}</p>
      </div>
    </div>
  ))}

  <div ref={loaderRef} className="h-10"></div>

  <div>Collections

  </div>
</div>



      {/* CENTER API FORM */}
      <div className="flex-1 p-6 overflow-auto space-y-4">
        <h2 className="text-2xl font-bold mb-4">API Request</h2>

        {/* URL INPUT */}
        <input
          className="w-full p-2 border rounded bg-gray-800 text-white"
          placeholder="Enter Request URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        {/* METHOD */}
        <select
          className="w-full p-2 border rounded bg-gray-800 text-white"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          {methods.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* HEADERS */}
        <textarea
          className="w-full h-28 p-2 border rounded bg-gray-800 text-white"
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
        />

        {/* BODY */}
        {(method === "POST" || method === "PUT") && (
          <textarea
            className="w-full h-40 p-2 border rounded bg-gray-800 text-white"
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
          />
        )}

        <button
          onClick={() => handleSendRequest()}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
        >
          Send Request
        </button>
      </div>

      {/* RESPONSE PANEL */}
      <div className="w-[25%] min-w-[250px] bg-black text-green-300 p-4 overflow-auto">
        <h2 className="font-bold text-lg mb-3 text-white">Response</h2>
        <pre className="text-sm whitespace-pre-wrap">{response}</pre>
      </div>
    </div>
  );
}
