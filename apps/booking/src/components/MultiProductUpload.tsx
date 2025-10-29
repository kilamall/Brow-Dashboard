import { useState, useRef, useCallback } from 'react';
import { compressImage, getCompressionStats } from '@buenobrows/shared/imageUtils';

interface ProductUpload {
  id: string;
  file: File;
  preview: string;
  productName: string;
  uploading: boolean;
  error?: string;
}

interface MultiProductUploadProps {
  onProductsChange: (products: ProductUpload[]) => void;
  maxProducts?: number;
  disabled?: boolean;
}

export default function MultiProductUpload({ 
  onProductsChange, 
  maxProducts = 5, 
  disabled = false 
}: MultiProductUploadProps) {
  const [products, setProducts] = useState<ProductUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    const newFiles = Array.from(files).slice(0, maxProducts - products.length);
    
    if (newFiles.length === 0) {
      return;
    }

    const newProducts: ProductUpload[] = [];
    
    for (const file of newFiles) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue;
      }

      // Validate file size (max 10MB before compression)
      if (file.size > 10 * 1024 * 1024) {
        continue;
      }

      try {
        // Compress image
        const compressedFile = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
        });

        const stats = getCompressionStats(file.size, compressedFile.size);
        console.log(`Product image compressed: ${stats.savingsPercent}% reduction`);

        // Create preview
        const preview = URL.createObjectURL(compressedFile);
        
        const product: ProductUpload = {
          id: `product_${Date.now()}_${Math.random()}`,
          file: compressedFile,
          preview,
          productName: '',
          uploading: false,
        };

        newProducts.push(product);
      } catch (error) {
        console.error('Error processing product image:', error);
      }
    }

    if (newProducts.length > 0) {
      const updatedProducts = [...products, ...newProducts];
      setProducts(updatedProducts);
      onProductsChange(updatedProducts);
    }
  }, [products, maxProducts, onProductsChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [disabled, handleFiles]);

  const removeProduct = useCallback((productId: string) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    onProductsChange(updatedProducts);
  }, [products, onProductsChange]);

  const updateProductName = useCallback((productId: string, name: string) => {
    const updatedProducts = products.map(p => 
      p.id === productId ? { ...p, productName: name } : p
    );
    setProducts(updatedProducts);
    onProductsChange(updatedProducts);
  }, [products, onProductsChange]);

  const canAddMore = products.length < maxProducts;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-terracotta bg-terracotta/5' 
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                Upload Product Photos
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop up to {maxProducts - products.length} more product{maxProducts - products.length !== 1 ? 's' : ''}, or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports JPG, PNG, WEBP (max 10MB each)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Product List */}
      {products.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Your Products ({products.length}/{maxProducts})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="space-y-3">
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={product.preview}
                      alt="Product preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      disabled={disabled}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Product Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={product.productName}
                      onChange={(e) => updateProductName(product.id, e.target.value)}
                      placeholder="e.g., Vitamin C Serum"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent text-sm"
                      disabled={disabled}
                    />
                  </div>
                  
                  {/* Upload Status */}
                  {product.uploading && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span>Uploading...</span>
                    </div>
                  )}
                  
                  {product.error && (
                    <div className="text-sm text-red-600">
                      {product.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {products.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">
            Upload photos of your skincare products to get personalized recommendations
          </p>
        </div>
      )}
    </div>
  );
}

