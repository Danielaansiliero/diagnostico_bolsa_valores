import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { searchTickers, Ticker } from '../services/api';

interface SearchFormProps {
  onSearch: (symbol: string, period: string) => void;
  loading: boolean;
}

export function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [symbol, setSymbol] = useState('');
  const [period, setPeriod] = useState('1mo');
  const [suggestions, setSuggestions] = useState<Ticker[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Buscar tickers com debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (symbol.length >= 1) {
      setIsSearching(true);
      debounceRef.current = setTimeout(async () => {
        const results = await searchTickers(symbol);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
        setSelectedIndex(-1);
        setIsSearching(false);
      }, 300);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
      setIsSearching(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [symbol]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectTicker(suggestions[selectedIndex]);
        } else {
          setShowDropdown(false);
          handleSubmit();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectTicker = (ticker: Ticker) => {
    setSymbol(ticker.symbol);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    if (symbol.trim()) {
      onSearch(symbol.trim(), period);
    }
  };

  return (
    <form
      className="search-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className="autocomplete-container">
        <input
          ref={inputRef}
          type="text"
          placeholder="Ex: PETR4"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          disabled={loading}
          autoComplete="off"
        />

        {showDropdown && (
          <div className="autocomplete-dropdown" ref={dropdownRef}>
            {isSearching ? (
              <div className="autocomplete-loading">Buscando...</div>
            ) : (
              suggestions.map((ticker, index) => (
                <div
                  key={ticker.symbol}
                  className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => selectTicker(ticker)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {ticker.logo && (
                    <img
                      src={ticker.logo}
                      alt={ticker.symbol}
                      className="ticker-logo"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="ticker-info">
                    <span className="ticker-symbol">{ticker.symbol}</span>
                    <span className="ticker-name">{ticker.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        disabled={loading}
      >
        <option value="1d">1 dia</option>
        <option value="5d">5 dias</option>
        <option value="1mo">1 mês</option>
        <option value="3mo">3 meses</option>
      </select>

      <button type="submit" disabled={loading || !symbol.trim()}>
        {loading ? 'Analisando...' : 'Analisar'}
      </button>
    </form>
  );
}
