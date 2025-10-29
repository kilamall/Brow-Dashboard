import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  type: string;
  timing: 'AM' | 'PM' | 'Both';
  frequency: string;
  ingredients: string[];
  concerns: string[];
}

interface RoutineStep {
  step: number;
  product: Product;
  reasoning: string;
  warnings?: string[];
}

interface IngredientConflict {
  products: string[];
  conflict: string;
  recommendation: string;
}

interface RoutineBuilderProps {
  analysis: {
    recommendedOrder?: RoutineStep[];
    ingredientConflicts?: IngredientConflict[];
    timingRecommendations?: {
      morning: string[];
      evening: string[];
    };
    personalizedRecommendations?: string[];
    suggestedReplacements?: {
      current: string;
      suggested: string;
      reason: string;
    }[];
  };
}

export default function RoutineBuilder({ analysis }: RoutineBuilderProps) {
  const [activeTab, setActiveTab] = useState<'routine' | 'conflicts' | 'timing' | 'recommendations'>('routine');

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <p>No routine analysis available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'routine', label: 'Routine Order', icon: '📋' },
            { id: 'conflicts', label: 'Ingredient Conflicts', icon: '⚠️' },
            { id: 'timing', label: 'Timing Guide', icon: '⏰' },
            { id: 'recommendations', label: 'Recommendations', icon: '💡' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-terracotta text-terracotta'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'routine' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recommended Application Order
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Follow this order for maximum product efficacy and absorption
              </p>
            </div>

            {analysis.recommendedOrder && analysis.recommendedOrder.length > 0 ? (
              <div className="space-y-4">
                {analysis.recommendedOrder.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-terracotta text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{step.product.name}</h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {step.product.type}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          step.product.timing === 'AM' ? 'bg-yellow-100 text-yellow-800' :
                          step.product.timing === 'PM' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {step.product.timing}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{step.reasoning}</p>
                      {step.warnings && step.warnings.length > 0 && (
                        <div className="space-y-1">
                          {step.warnings.map((warning, warningIndex) => (
                            <div key={warningIndex} className="flex items-center space-x-2 text-sm text-orange-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span>{warning}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No routine order available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'conflicts' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ingredient Conflicts & Warnings
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Important interactions between your products that could cause irritation or reduce effectiveness
              </p>
            </div>

            {analysis.ingredientConflicts && analysis.ingredientConflicts.length > 0 ? (
              <div className="space-y-4">
                {analysis.ingredientConflicts.map((conflict, index) => (
                  <div key={index} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-orange-900 mb-1">
                          {conflict.products.join(' + ')}
                        </h4>
                        <p className="text-sm text-orange-800 mb-2">{conflict.conflict}</p>
                        <p className="text-sm text-orange-700 font-medium">{conflict.recommendation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-medium text-green-800">No conflicts detected!</p>
                <p className="text-sm text-green-600">Your products work well together</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timing' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Timing Recommendations
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                When to use each product for optimal results
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Morning Routine */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-yellow-900">Morning Routine</h4>
                </div>
                {analysis.timingRecommendations?.morning && analysis.timingRecommendations.morning.length > 0 ? (
                  <ul className="space-y-2">
                    {analysis.timingRecommendations.morning.map((step, index) => (
                      <li key={index} className="text-sm text-yellow-800 flex items-start space-x-2">
                        <span className="w-5 h-5 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-medium text-yellow-800 mt-0.5">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-yellow-700">No morning routine specified</p>
                )}
              </div>

              {/* Evening Routine */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-purple-900">Evening Routine</h4>
                </div>
                {analysis.timingRecommendations?.evening && analysis.timingRecommendations.evening.length > 0 ? (
                  <ul className="space-y-2">
                    {analysis.timingRecommendations.evening.map((step, index) => (
                      <li key={index} className="text-sm text-purple-800 flex items-start space-x-2">
                        <span className="w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center text-xs font-medium text-purple-800 mt-0.5">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-purple-700">No evening routine specified</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Personalized Recommendations
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Customized advice based on your skin analysis and product routine
              </p>
            </div>

            {/* Personalized Recommendations */}
            {analysis.personalizedRecommendations && analysis.personalizedRecommendations.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Optimization Tips</h4>
                <div className="space-y-3">
                  {analysis.personalizedRecommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <p className="text-sm text-blue-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Replacements */}
            {analysis.suggestedReplacements && analysis.suggestedReplacements.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Suggested Replacements</h4>
                <div className="space-y-3">
                  {analysis.suggestedReplacements.map((replacement, index) => (
                    <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{replacement.current}</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span className="font-medium text-terracotta">{replacement.suggested}</span>
                      </div>
                      <p className="text-sm text-gray-600">{replacement.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!analysis.personalizedRecommendations || analysis.personalizedRecommendations.length === 0) && 
             (!analysis.suggestedReplacements || analysis.suggestedReplacements.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>No specific recommendations available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

