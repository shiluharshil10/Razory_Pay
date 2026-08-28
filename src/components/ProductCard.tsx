import React from 'react';
import { Star, Plus, Check } from 'lucide-react';
import { Product } from '../types';
import { formatINR } from '../utils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isAdded?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  isAdded,
}) => {
  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
    >
      {/* Image & Tag */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        {product.tag && (
          <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs">
            {product.tag}
          </span>
        )}
        <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-slate-800 text-xs font-semibold px-2 py-0.5 rounded-md border border-slate-200/60">
          {product.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-800">{product.rating}</span>
            <span className="text-xs text-slate-400">({product.reviewsCount})</span>
          </div>

          <h3 className="font-semibold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900">{formatINR(product.price)}</span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatINR(product.originalPrice)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">In Stock • Ready to ship</span>
          </div>

          <button
            id={`add-to-cart-${product.id}`}
            onClick={() => onAddToCart(product)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
