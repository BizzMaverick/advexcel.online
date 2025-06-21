import React, { useState } from 'react';
import { Calculator, TrendingUp, Filter, Palette, BarChart3, Database, Search, Calendar, Hash, Type, Zap, BookOpen, X } from 'lucide-react';

interface FunctionPanelProps {
  onFunctionSelect: (category: string, func: string) => void;
}

export const FunctionPanel: React.FC<FunctionPanelProps> = ({ onFunctionSelect }) => {
  const [activeCategory, setActiveCategory] = useState<string>('math');
  const [searchTerm, setSearchTerm] = useState('');

  const functionCategories = {
    math: {
      icon: Calculator,
      label: 'Math & Stats',
      color: 'bg-blue-100 text-blue-700',
      functions: [
        { name: 'SUM', description: 'Sum of values in range', syntax: '=SUM(A1:A10)', example: 'SUM(B2:B10)' },
        { name: 'AVERAGE', description: 'Average of values', syntax: '=AVERAGE(A1:A10)', example: 'AVERAGE(C1:C20)' },
        { name: 'COUNT', description: 'Count of non-empty cells', syntax: '=COUNT(A1:A10)', example: 'COUNT(D1:D50)' },
        { name: 'COUNTA', description: 'Count of non-blank cells', syntax: '=COUNTA(A1:A10)', example: 'COUNTA(A:A)' },
        { name: 'MIN', description: 'Minimum value', syntax: '=MIN(A1:A10)', example: 'MIN(E1:E100)' },
        { name: 'MAX', description: 'Maximum value', syntax: '=MAX(A1:A10)', example: 'MAX(F1:F100)' },
        { name: 'MEDIAN', description: 'Middle value in dataset', syntax: '=MEDIAN(A1:A10)', example: 'MEDIAN(G1:G50)' },
        { name: 'MODE', description: 'Most frequent value', syntax: '=MODE(A1:A10)', example: 'MODE(H1:H30)' },
        { name: 'STDEV', description: 'Standard deviation', syntax: '=STDEV(A1:A10)', example: 'STDEV(I1:I25)' },
        { name: 'VAR', description: 'Variance of dataset', syntax: '=VAR(A1:A10)', example: 'VAR(J1:J40)' },
        { name: 'ROUND', description: 'Round to specified digits', syntax: '=ROUND(A1,2)', example: 'ROUND(K1,0)' },
        { name: 'ROUNDUP', description: 'Round up to digits', syntax: '=ROUNDUP(A1,2)', example: 'ROUNDUP(L1,1)' },
        { name: 'ROUNDDOWN', description: 'Round down to digits', syntax: '=ROUNDDOWN(A1,2)', example: 'ROUNDDOWN(M1,2)' },
        { name: 'ABS', description: 'Absolute value', syntax: '=ABS(A1)', example: 'ABS(N1)' },
        { name: 'SQRT', description: 'Square root', syntax: '=SQRT(A1)', example: 'SQRT(O1)' },
        { name: 'POWER', description: 'Number raised to power', syntax: '=POWER(A1,2)', example: 'POWER(P1,3)' },
        { name: 'SUMIF', description: 'Sum with condition', syntax: '=SUMIF(A1:A10,">5",B1:B10)', example: 'SUMIF(Q1:Q10,">=100",R1:R10)' },
        { name: 'SUMIFS', description: 'Sum with multiple conditions', syntax: '=SUMIFS(C1:C10,A1:A10,">5",B1:B10,"<10")', example: 'SUMIFS(S1:S10,T1:T10,"Sales",U1:U10,">1000")' },
        { name: 'AVERAGEIF', description: 'Average with condition', syntax: '=AVERAGEIF(A1:A10,">5",B1:B10)', example: 'AVERAGEIF(V1:V10,"Pass",W1:W10)' },
        { name: 'COUNTIF', description: 'Count with condition', syntax: '=COUNTIF(A1:A10,">5")', example: 'COUNTIF(X1:X10,"Complete")' },
        { name: 'COUNTIFS', description: 'Count with multiple conditions', syntax: '=COUNTIFS(A1:A10,">5",B1:B10,"<10")', example: 'COUNTIFS(Y1:Y10,"Active",Z1:Z10,">50")' }
      ]
    },
    lookup: {
      icon: Database,
      label: 'Lookup & Reference',
      color: 'bg-green-100 text-green-700',
      functions: [
        { name: 'VLOOKUP', description: 'Vertical lookup in table', syntax: '=VLOOKUP(A1,B:D,2,FALSE)', example: 'VLOOKUP(E1,A:C,3,0)' },
        { name: 'HLOOKUP', description: 'Horizontal lookup in table', syntax: '=HLOOKUP(A1,B1:D5,2,FALSE)', example: 'HLOOKUP(F1,A1:Z5,3,FALSE)' },
        { name: 'INDEX', description: 'Return value at position', syntax: '=INDEX(A1:A10,5)', example: 'INDEX(B:B,MATCH(G1,A:A,0))' },
        { name: 'MATCH', description: 'Find position of value', syntax: '=MATCH(A1,B1:B10,0)', example: 'MATCH("Product",A1:A100,0)' },
        { name: 'XLOOKUP', description: 'Advanced lookup function', syntax: '=XLOOKUP(A1,B:B,C:C)', example: 'XLOOKUP(H1,Names,Scores)' },
        { name: 'CHOOSE', description: 'Choose value from list', syntax: '=CHOOSE(A1,"Red","Blue","Green")', example: 'CHOOSE(I1,"Q1","Q2","Q3","Q4")' },
        { name: 'OFFSET', description: 'Reference offset from cell', syntax: '=OFFSET(A1,2,1)', example: 'OFFSET(J1,K1,L1,M1,N1)' },
        { name: 'INDIRECT', description: 'Reference from text', syntax: '=INDIRECT("A1")', example: 'INDIRECT("Sheet2!A"&O1)' },
        { name: 'ROW', description: 'Row number of reference', syntax: '=ROW(A1)', example: 'ROW()' },
        { name: 'COLUMN', description: 'Column number of reference', syntax: '=COLUMN(A1)', example: 'COLUMN()' },
        { name: 'ROWS', description: 'Number of rows in range', syntax: '=ROWS(A1:A10)', example: 'ROWS(P1:P100)' },
        { name: 'COLUMNS', description: 'Number of columns in range', syntax: '=COLUMNS(A1:D1)', example: 'COLUMNS(Q1:Z1)' }
      ]
    },
    logical: {
      icon: TrendingUp,
      label: 'Logical',
      color: 'bg-purple-100 text-purple-700',
      functions: [
        { name: 'IF', description: 'Conditional logic', syntax: '=IF(A1>10,"High","Low")', example: 'IF(R1>=90,"A",IF(R1>=80,"B","C"))' },
        { name: 'IFS', description: 'Multiple conditions', syntax: '=IFS(A1>90,"A",A1>80,"B",TRUE,"C")', example: 'IFS(S1="Red",1,S1="Blue",2,S1="Green",3)' },
        { name: 'AND', description: 'All conditions true', syntax: '=AND(A1>5,B1<10)', example: 'AND(T1>0,U1<100,V1="Active")' },
        { name: 'OR', description: 'Any condition true', syntax: '=OR(A1>5,B1<10)', example: 'OR(W1="Yes",X1="True",Y1=1)' },
        { name: 'NOT', description: 'Reverse logical value', syntax: '=NOT(A1>10)', example: 'NOT(Z1="Complete")' },
        { name: 'XOR', description: 'Exclusive OR', syntax: '=XOR(A1>5,B1<10)', example: 'XOR(AA1,BB1)' },
        { name: 'IFERROR', description: 'Handle errors', syntax: '=IFERROR(A1/B1,"Error")', example: 'IFERROR(VLOOKUP(CC1,DD:EE,2,0),"Not Found")' },
        { name: 'IFNA', description: 'Handle #N/A errors', syntax: '=IFNA(VLOOKUP(A1,B:C,2,0),"Not Found")', example: 'IFNA(MATCH(FF1,GG:GG,0),"Missing")' },
        { name: 'ISBLANK', description: 'Check if cell is blank', syntax: '=ISBLANK(A1)', example: 'ISBLANK(HH1)' },
        { name: 'ISNUMBER', description: 'Check if value is number', syntax: '=ISNUMBER(A1)', example: 'ISNUMBER(II1)' },
        { name: 'ISTEXT', description: 'Check if value is text', syntax: '=ISTEXT(A1)', example: 'ISTEXT(JJ1)' },
        { name: 'ISERROR', description: 'Check if value is error', syntax: '=ISERROR(A1)', example: 'ISERROR(KK1/LL1)' }
      ]
    },
    text: {
      icon: Type,
      label: 'Text Functions',
      color: 'bg-yellow-100 text-yellow-700',
      functions: [
        { name: 'CONCATENATE', description: 'Join text strings', syntax: '=CONCATENATE(A1," ",B1)', example: 'CONCATENATE(MM1,"-",NN1)' },
        { name: 'CONCAT', description: 'Join text (newer)', syntax: '=CONCAT(A1:C1)', example: 'CONCAT(OO1:QQ1)' },
        { name: 'TEXTJOIN', description: 'Join with delimiter', syntax: '=TEXTJOIN(",",TRUE,A1:C1)', example: 'TEXTJOIN(" | ",TRUE,RR1:TT1)' },
        { name: 'LEFT', description: 'Left characters', syntax: '=LEFT(A1,3)', example: 'LEFT(UU1,5)' },
        { name: 'RIGHT', description: 'Right characters', syntax: '=RIGHT(A1,3)', example: 'RIGHT(VV1,4)' },
        { name: 'MID', description: 'Middle characters', syntax: '=MID(A1,2,3)', example: 'MID(WW1,3,6)' },
        { name: 'LEN', description: 'Length of text', syntax: '=LEN(A1)', example: 'LEN(XX1)' },
        { name: 'FIND', description: 'Find text position', syntax: '=FIND("text",A1)', example: 'FIND("@",YY1)' },
        { name: 'SEARCH', description: 'Search text (case insensitive)', syntax: '=SEARCH("text",A1)', example: 'SEARCH("error",ZZ1)' },
        { name: 'SUBSTITUTE', description: 'Replace text', syntax: '=SUBSTITUTE(A1,"old","new")', example: 'SUBSTITUTE(AAA1," ","_")' },
        { name: 'REPLACE', description: 'Replace by position', syntax: '=REPLACE(A1,2,3,"new")', example: 'REPLACE(BBB1,1,3,"XXX")' },
        { name: 'UPPER', description: 'Convert to uppercase', syntax: '=UPPER(A1)', example: 'UPPER(CCC1)' },
        { name: 'LOWER', description: 'Convert to lowercase', syntax: '=LOWER(A1)', example: 'LOWER(DDD1)' },
        { name: 'PROPER', description: 'Proper case', syntax: '=PROPER(A1)', example: 'PROPER(EEE1)' },
        { name: 'TRIM', description: 'Remove extra spaces', syntax: '=TRIM(A1)', example: 'TRIM(FFF1)' },
        { name: 'CLEAN', description: 'Remove non-printable chars', syntax: '=CLEAN(A1)', example: 'CLEAN(GGG1)' }
      ]
    },
    date: {
      icon: Calendar,
      label: 'Date & Time',
      color: 'bg-indigo-100 text-indigo-700',
      functions: [
        { name: 'TODAY', description: 'Current date', syntax: '=TODAY()', example: 'TODAY()' },
        { name: 'NOW', description: 'Current date and time', syntax: '=NOW()', example: 'NOW()' },
        { name: 'DATE', description: 'Create date from parts', syntax: '=DATE(2024,1,15)', example: 'DATE(HHH1,III1,JJJ1)' },
        { name: 'TIME', description: 'Create time from parts', syntax: '=TIME(14,30,0)', example: 'TIME(KKK1,LLL1,MMM1)' },
        { name: 'YEAR', description: 'Extract year', syntax: '=YEAR(A1)', example: 'YEAR(NNN1)' },
        { name: 'MONTH', description: 'Extract month', syntax: '=MONTH(A1)', example: 'MONTH(OOO1)' },
        { name: 'DAY', description: 'Extract day', syntax: '=DAY(A1)', example: 'DAY(PPP1)' },
        { name: 'WEEKDAY', description: 'Day of week number', syntax: '=WEEKDAY(A1)', example: 'WEEKDAY(QQQ1,2)' },
        { name: 'WEEKNUM', description: 'Week number of year', syntax: '=WEEKNUM(A1)', example: 'WEEKNUM(RRR1,2)' },
        { name: 'DATEDIF', description: 'Difference between dates', syntax: '=DATEDIF(A1,B1,"D")', example: 'DATEDIF(SSS1,TTT1,"M")' },
        { name: 'WORKDAY', description: 'Working day calculation', syntax: '=WORKDAY(A1,10)', example: 'WORKDAY(UUU1,VVV1,WWW1:XXX1)' },
        { name: 'NETWORKDAYS', description: 'Network days between dates', syntax: '=NETWORKDAYS(A1,B1)', example: 'NETWORKDAYS(YYY1,ZZZ1)' },
        { name: 'EDATE', description: 'Date plus/minus months', syntax: '=EDATE(A1,3)', example: 'EDATE(AAAA1,6)' },
        { name: 'EOMONTH', description: 'End of month', syntax: '=EOMONTH(A1,0)', example: 'EOMONTH(BBBB1,-1)' }
      ]
    },
    financial: {
      icon: Hash,
      label: 'Financial',
      color: 'bg-emerald-100 text-emerald-700',
      functions: [
        { name: 'PMT', description: 'Payment calculation', syntax: '=PMT(5%/12,60,10000)', example: 'PMT(CCCC1/12,DDDD1,EEEE1)' },
        { name: 'PV', description: 'Present value', syntax: '=PV(5%/12,60,1000)', example: 'PV(FFFF1,GGGG1,HHHH1)' },
        { name: 'FV', description: 'Future value', syntax: '=FV(5%/12,60,1000)', example: 'FV(IIII1,JJJJ1,KKKK1)' },
        { name: 'NPV', description: 'Net present value', syntax: '=NPV(10%,A1:A5)', example: 'NPV(LLLL1,MMMM1:QQQQ1)' },
        { name: 'IRR', description: 'Internal rate of return', syntax: '=IRR(A1:A5)', example: 'IRR(RRRR1:VVVV1)' },
        { name: 'RATE', description: 'Interest rate per period', syntax: '=RATE(60,1000,50000)', example: 'RATE(WWWW1,XXXX1,YYYY1)' },
        { name: 'NPER', description: 'Number of periods', syntax: '=NPER(5%/12,1000,50000)', example: 'NPER(ZZZZ1,AAAAA1,BBBBB1)' },
        { name: 'PPMT', description: 'Principal payment', syntax: '=PPMT(5%/12,1,60,10000)', example: 'PPMT(CCCCC1,DDDDD1,EEEEE1,FFFFF1)' },
        { name: 'IPMT', description: 'Interest payment', syntax: '=IPMT(5%/12,1,60,10000)', example: 'IPMT(GGGGG1,HHHHH1,IIIII1,JJJJJ1)' }
      ]
    },
    data: {
      icon: BarChart3,
      label: 'Data Analysis',
      color: 'bg-red-100 text-red-700',
      functions: [
        { name: 'PIVOT TABLE', description: 'Create pivot table', syntax: 'Select data range and create pivot', example: 'Use Pivot Table panel' },
        { name: 'FILTER', description: 'Filter data by criteria', syntax: 'Apply filter to range', example: 'Data > Filter' },
        { name: 'SORT', description: 'Sort data', syntax: 'Sort selected range', example: 'Data > Sort' },
        { name: 'SUBTOTAL', description: 'Calculate subtotals', syntax: '=SUBTOTAL(9,A1:A10)', example: 'SUBTOTAL(109,KKKKK1:LLLLL1)' },
        { name: 'AGGREGATE', description: 'Aggregate with options', syntax: '=AGGREGATE(1,6,A1:A10)', example: 'AGGREGATE(9,5,MMMMM1:NNNNN1)' },
        { name: 'FREQUENCY', description: 'Frequency distribution', syntax: '=FREQUENCY(A1:A10,B1:B5)', example: 'FREQUENCY(OOOOO1:PPPPP1,QQQQQ1:RRRRR1)' },
        { name: 'RANK', description: 'Rank of number', syntax: '=RANK(A1,A1:A10,0)', example: 'RANK(SSSSS1,TTTTT1:UUUUU1,1)' },
        { name: 'PERCENTILE', description: 'Percentile of array', syntax: '=PERCENTILE(A1:A10,0.9)', example: 'PERCENTILE(VVVVV1:WWWWW1,0.75)' },
        { name: 'QUARTILE', description: 'Quartile of array', syntax: '=QUARTILE(A1:A10,1)', example: 'QUARTILE(XXXXX1:YYYYY1,3)' }
      ]
    },
    format: {
      icon: Palette,
      label: 'Formatting',
      color: 'bg-pink-100 text-pink-700',
      functions: [
        { name: 'CONDITIONAL FORMAT', description: 'Format based on conditions', syntax: 'Apply conditional formatting rules', example: 'Home > Conditional Formatting' },
        { name: 'NUMBER FORMAT', description: 'Format numbers', syntax: 'Apply number formatting', example: 'Format Cells > Number' },
        { name: 'DATE FORMAT', description: 'Format dates', syntax: 'Apply date formatting', example: 'Format Cells > Date' },
        { name: 'CURRENCY', description: 'Format as currency', syntax: 'Apply currency formatting', example: 'Format Cells > Currency' },
        { name: 'PERCENTAGE', description: 'Format as percentage', syntax: 'Apply percentage formatting', example: 'Format Cells > Percentage' },
        { name: 'TEXT FORMAT', description: 'Text formatting options', syntax: 'Apply text formatting', example: 'Format Cells > Font' }
      ]
    },
    advanced: {
      icon: Zap,
      label: 'Advanced',
      color: 'bg-orange-100 text-orange-700',
      functions: [
        { name: 'ARRAY FORMULA', description: 'Array calculations', syntax: '=SUM(IF(A1:A10>5,B1:B10,0))', example: 'Ctrl+Shift+Enter for array' },
        { name: 'DYNAMIC ARRAY', description: 'Spill formulas', syntax: '=UNIQUE(A1:A10)', example: 'UNIQUE(ZZZZZ1:AAAAAA1)' },
        { name: 'LAMBDA', description: 'Custom functions', syntax: '=LAMBDA(x,x*2)(A1)', example: 'LAMBDA(x,y,x+y)(BBBBBB1,CCCCCC1)' },
        { name: 'LET', description: 'Define variables', syntax: '=LET(x,A1*2,y,B1*3,x+y)', example: 'LET(rate,DDDDDD1,years,EEEEEE1,rate*years)' },
        { name: 'XLOOKUP', description: 'Advanced lookup', syntax: '=XLOOKUP(A1,B:B,C:C)', example: 'XLOOKUP(FFFFFF1,GGGGGG:GGGGGG,HHHHHH:HHHHHH)' },
        { name: 'FILTER', description: 'Dynamic filter', syntax: '=FILTER(A1:C10,B1:B10>5)', example: 'FILTER(IIIIII1:KKKKKK10,JJJJJJ1:JJJJJJ10="Active")' },
        { name: 'SORT', description: 'Dynamic sort', syntax: '=SORT(A1:C10,2,-1)', example: 'SORT(LLLLLL1:NNNNNN10,2,1)' },
        { name: 'UNIQUE', description: 'Unique values', syntax: '=UNIQUE(A1:A10)', example: 'UNIQUE(OOOOOO1:OOOOOO100)' }
      ]
    }
  };

  const allFunctions = Object.values(functionCategories).flatMap(category => 
    category.functions.map(func => ({ ...func, category: category.label }))
  );

  const filteredFunctions = searchTerm 
    ? allFunctions.filter(func => 
        func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : functionCategories[activeCategory as keyof typeof functionCategories]?.functions || [];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Excel Functions</h3>
        </div>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search functions..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Category tabs */}
        {!searchTerm && (
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(functionCategories).map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`
                    flex items-center space-x-1 p-2 rounded-lg text-xs font-medium transition-all duration-200
                    ${activeCategory === key 
                      ? `${category.color} shadow-md` 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <IconComponent className="h-3 w-3" />
                  <span className="truncate">{category.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Function list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {searchTerm && (
            <div className="text-sm text-gray-600 mb-3">
              Found {filteredFunctions.length} function{filteredFunctions.length !== 1 ? 's' : ''}
            </div>
          )}
          
          {filteredFunctions.map((func, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-3 hover:bg-blue-50 transition-colors duration-200 cursor-pointer border border-gray-200 hover:border-blue-200 group"
              onClick={() => onFunctionSelect(activeCategory, func.name)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-700 text-sm group-hover:text-blue-800">{func.name}</h4>
                <div className="flex items-center space-x-1">
                  {searchTerm && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                      {func.category}
                    </span>
                  )}
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full group-hover:bg-blue-200">
                    Function
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mb-2 leading-relaxed">{func.description}</p>
              
              <div className="space-y-2">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Syntax:</div>
                  <div className="bg-gray-100 rounded p-2 group-hover:bg-white transition-colors">
                    <code className="text-xs text-gray-800 font-mono break-all">{func.syntax}</code>
                  </div>
                </div>
                
                {func.example && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Example:</div>
                    <div className="bg-green-50 rounded p-2 group-hover:bg-green-100 transition-colors">
                      <code className="text-xs text-green-800 font-mono break-all">{func.example}</code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {filteredFunctions.length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No functions found matching "{searchTerm}"</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Excel Functions Library</div>
          <div className="text-xs text-gray-400">
            {Object.values(functionCategories).reduce((sum, cat) => sum + cat.functions.length, 0)} functions available
          </div>
        </div>
      </div>
    </div>
  );
};