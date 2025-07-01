import React, { useState, useEffect } from 'react';
import { trackSearch } from '../utils/analytics';

const SearchInterface = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Generate suggestions based on query
  useEffect(() => {
    if (query.length > 2) {
      const commonQueries = [
        'context classification',
        'experience translation',
        'tone adaptation',
        'best practices',
        'api reference',
        'getting started'
      ];
      
      const matches = commonQueries.filter(q => 
        q.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    
    try {
      // Track search query
      trackSearch(query);
      
      // Update search history
      const newHistory = [query, ...searchHistory.slice(0, 4)];
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      
      // Format query for Claude Will
      const formattedQuery = `Search the resume-engine documentation for: ${query}. 
        Include relevant code examples, best practices, and implementation details.`;
      
      const response = await window.ClaudeWill.search(formattedQuery);
      setResults(response);
    } catch (error) {
      console.error('Search failed:', error);
      setResults({
        error: 'Search failed. Please try again or contact support.'
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="search-interface">
      <form onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Claude Will about the resume engine..."
            className="search-input"
            list="search-suggestions"
          />
          <datalist id="search-suggestions">
            {suggestions.map((suggestion, index) => (
              <option key={index} value={suggestion} />
            ))}
          </datalist>
          <button 
            type="submit" 
            className="search-button"
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {searchHistory.length > 0 && (
        <div className="search-history">
          <h4>Recent Searches</h4>
          <ul>
            {searchHistory.map((item, index) => (
              <li key={index}>
                <button onClick={() => setQuery(item)}>{item}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {results && (
        <div className="search-results">
          {results.error ? (
            <div className="error-message">{results.error}</div>
          ) : (
            <>
              <div className="results-header">
                <h3>Search Results</h3>
                <span className="results-count">
                  {results.length} results found
                </span>
              </div>
              <div className="results-list">
                {results.map((result, index) => (
                  <div key={index} className="result-item">
                    <h4>{result.title}</h4>
                    <p>{result.excerpt}</p>
                    {result.code && (
                      <pre><code>{result.code}</code></pre>
                    )}
                    <div className="result-meta">
                      <span className="result-type">{result.type}</span>
                      <a href={result.link} className="result-link">
                        View Details
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      
      <div className="search-tips">
        <p>Try asking things like:</p>
        <ul>
          <li>"How do I implement context classification?"</li>
          <li>"What's the best way to format experience input?"</li>
          <li>"Show me examples of tone adaptation"</li>
        </ul>
      </div>
    </div>
  );
};

export default SearchInterface; 