import React, { useEffect } from 'react';
import { SUPPORTED_LANGUAGES, DEFAULT_CODE } from '../constants';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  onSubmit: () => void;
  isJudging: boolean;
  canSubmit: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, language, setLanguage, onSubmit, isJudging, canSubmit }) => {
  
  useEffect(() => {
    // Only reset to default code if the user hasn't typed anything
    if (code === '' || Object.values(DEFAULT_CODE).includes(code)) {
      setCode(DEFAULT_CODE[language] || '');
    }
  }, [language, setCode]);


  return (
    <div className="bg-secondary rounded-lg flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-accent">
        <div>
          <label htmlFor="language-select" className="sr-only">Ngôn ngữ</label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-accent text-text-primary rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-highlight"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <button
          onClick={onSubmit}
          disabled={isJudging || !canSubmit}
          className="flex items-center justify-center bg-highlight text-white font-semibold px-4 py-2 rounded-md hover:bg-red-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isJudging ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang chấm...
            </>
          ) : (
            'Nộp bài'
          )}
        </button>
      </div>
      <div className="flex-grow relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full bg-primary p-4 font-mono text-base leading-6 text-text-primary resize-none border-none outline-none custom-scrollbar"
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default CodeEditor;
