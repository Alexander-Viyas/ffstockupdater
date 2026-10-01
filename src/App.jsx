import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, PlusSquare, Calendar, Settings as SettingsIcon, Upload, Check, Plus, Minus, Trash2, Image as ImageIcon, ChevronRight, Menu, X 
} from 'lucide-react';

// --- Reusable Ticker Interface ---
function TickerInterface({ image, markers, setMarkers, onSave, title, markerStyle, availableColours }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClick, setCurrentClick] = useState(null);
  
  // Custom variant toggle
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customVariantName, setCustomVariantName] = useState('');
  
  const imageRef = useRef(null);

  const handleImageClick = (e) => {
    if (e.target.closest('.marker')) return;
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCurrentClick({ x, y });
    
    // Reset modal state
    setCustomVariantName('');
    setShowCustomInput(!availableColours || availableColours.length === 0);
    setIsModalOpen(true);
  };

  const handleAddPredefinedVariant = (colour) => {
    setMarkers([...markers, { id: uuidv4(), name: colour, qty: 1, x: currentClick.x, y: currentClick.y }]);
    setIsModalOpen(false);
  };

  const handleAddCustomVariant = (e) => {
    e.preventDefault();
    if (!customVariantName.trim()) return;
    setMarkers([...markers, { id: uuidv4(), name: customVariantName, qty: 1, x: currentClick.x, y: currentClick.y }]);
    setIsModalOpen(false);
  };

  const handleIncrement = (id, e) => {
    if (e) e.stopPropagation();
    setMarkers(markers.map(m => m.id === id ? { ...m, qty: m.qty + 1 } : m));
  };

  const handleDecrement = (id) => {
    setMarkers(markers.map(m => m.id === id && m.qty > 0 ? { ...m, qty: m.qty - 1 } : m));
  };

  const handleDelete = (id) => {
    setMarkers(markers.filter(m => m.id !== id));
  };

  const total = markers.reduce((sum, m) => sum + m.qty, 0);

  return (
    <div className="ticker-workspace">
      <div className="image-area">
        {!image ? (
          <div style={{ color: 'var(--text-muted)' }}>No image provided</div>
        ) : (
          <div
            ref={imageRef}
            className="image-wrapper"
            onClick={handleImageClick}
            style={{ position: 'relative', display: 'inline-block', lineHeight: 0, cursor: 'crosshair' }}
          >
            <img
              src={image}
              alt="Group"
              draggable="false"
              style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', userSelect: 'none', pointerEvents: 'none' }}
            />
            <AnimatePresence>
              {markers.map(marker => (
                <motion.div
                  key={marker.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="marker"
                  style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                  onClick={(e) => handleIncrement(marker.id, e)}
                  title="Click to add +1"
                >
                  <div className="marker-pin">
                    {markerStyle === 'numbers' ? marker.qty : <Check size={20} />}
                  </div>
                  <div className="marker-tooltip">
                    {marker.name} • Qty: {marker.qty}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="side-panel">
        <div className="panel-header">
          <span>{title || 'Variants'}</span>
          <span className="badge">Total: {total}</span>
        </div>
        <div className="panel-body">
          {markers.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>
              <p>Click on the image to add variants.</p>
            </div>
          ) : (
            markers.map(marker => (
              <div key={marker.id} className="variant-item">
                <div className="variant-info">
                  <span className="variant-name">{marker.name}</span>
                  <span className="variant-qty">Qty: {marker.qty}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => handleDecrement(marker.id)} style={{ padding: '4px', cursor: 'pointer' }}><Minus size={14}/></button>
                  <span>{marker.qty}</span>
                  <button onClick={(e) => handleIncrement(marker.id, e)} style={{ padding: '4px', cursor: 'pointer' }}><Plus size={14}/></button>
                  <button onClick={() => handleDelete(marker.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', marginLeft: '10px' }}>
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={onSave}>
            Save Changes
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Select Variant</h3>
              <button className="btn-outline" style={{ padding: '4px 8px', border: 'none' }} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            {availableColours && availableColours.length > 0 && !showCustomInput && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Choose a pre-defined colour:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {availableColours.map(c => (
                    <button key={c} type="button" className="btn btn-outline" onClick={() => handleAddPredefinedVariant(c)}>
                      {c}
                    </button>
                  ))}
                </div>
                
                <div style={{ margin: '15px 0', borderTop: '1px solid var(--border)' }}></div>
                
                <button type="button" className="btn btn-secondary" style={{ width: '100%', background: 'transparent', border: '1px dashed var(--accent)', color: 'var(--accent)' }} onClick={() => setShowCustomInput(true)}>
                  + Add Custom Variant
                </button>
              </div>
            )}

            {showCustomInput && (
              <form onSubmit={handleAddCustomVariant}>
                <div className="form-group">
                  <label>Variant Name</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={customVariantName}
                    onChange={(e) => setCustomVariantName(e.target.value)}
                    autoFocus
                    placeholder="e.g. Special Blue"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  {availableColours && availableColours.length > 0 && (
                    <button type="button" className="btn btn-outline" onClick={() => setShowCustomInput(false)}>Back</button>
                  )}
                  <button type="submit" className="btn btn-primary">Add</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Pages ---

// 1. Dashboard / Products List
function ProductsList({ products, settings, deleteProduct }) {
  const navigate = useNavigate();
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <h2>All Products</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-outline" 
            style={{ color: isDeleteMode ? 'var(--text)' : 'var(--danger)', borderColor: isDeleteMode ? 'var(--border)' : 'var(--danger)' }} 
            onClick={() => setIsDeleteMode(!isDeleteMode)}
          >
            {isDeleteMode ? 'Done' : <><Trash2 size={16}/> Delete</>}
          </button>
          <Link to="/add-product" className="btn btn-primary"><Plus size={18}/> Add Product</Link>
        </div>
      </div>
      <div className="grid-3">
        {products.map(p => {
          const totalStock = p.sizesList.reduce((sum, size) => {
            const markers = p.stockData[size]?.markers || [];
            return sum + markers.reduce((acc, m) => acc + m.qty, 0);
          }, 0);

          return (
            <div key={p.id} className="card card-clickable" style={{ position: 'relative' }} onClick={() => navigate(`/product/${p.id}`)}>
              {isDeleteMode && (
                <button 
                  className="btn" 
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', color: 'var(--danger)', padding: '8px', borderRadius: '50%', zIndex: 10, boxShadow: 'var(--shadow)', border: '1px solid var(--danger)' }}
                  onClick={(e) => {
                     e.stopPropagation();
                     deleteProduct(p.id);
                  }}
                >
                  <Trash2 size={18} />
                </button>
              )}
              {p.image ? (
                <img src={p.image} alt={p.name} className="product-thumbnail" />
              ) : (
                <div className="product-thumbnail">
                  <ImageIcon size={48} opacity={0.5} />
                </div>
              )}
              <h3 style={{ marginBottom: '10px' }}>{p.name}</h3>
              {p.type && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Type: {p.type}</p>}
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{p.colours} colours, {p.sizes}</p>
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge">{totalStock} in stock</span>
                <span style={{ color: 'var(--accent)' }}><ChevronRight size={20}/></span>
              </div>
            </div>
          );
        })}
        {products.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>No products yet. Add a new product to get started.</p>
        )}
      </div>
    </div>
  );
}

// --- Cloud Data & Storage Integration ---
import { 
  subscribeProducts, saveProductToCloud, deleteProductFromCloud,
  subscribeDailySections, saveDailySectionToCloud, deleteDailySectionFromCloud,
  subscribeSettings, saveSettingsToCloud, processAndUploadImage 
} from './services/stockService';

// 2. Add New Product
function AddProduct({ onAdd, settings }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState(settings.productTypes[0] || 'Joggers');
  const [colours, setColours] = useState('');
  const [sizes, setSizes] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const handleImage = async (e) => {
    if (e.target.files[0]) {
      setUploading(true);
      try {
        const cloudUrl = await processAndUploadImage(e.target.files[0]);
        setImage(cloudUrl);
      } catch (err) {
        console.error("Image upload failed:", err);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const sizesList = sizes.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const coloursList = colours.split(',').map(c => c.trim()).filter(c => c.length > 0);
    
    if (sizesList.length === 0) sizesList.push('Default');

    onAdd({ 
      id: uuidv4(), 
      name, 
      type, 
      colours: coloursList.join(', '), 
      coloursList,
      sizes: sizesList.join(', '), 
      sizesList,
      image, 
      stockData: {} 
    });
    navigate('/');
  };

  return (
    <div className="page-body">
      <h2>Add New Product</h2>
      <br/>
      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input type="text" className="form-control" required value={name} onChange={e=>setName(e.target.value)}/>
          </div>
          <div className="form-group">
            <label>Product Type</label>
            <select className="form-control" value={type} onChange={e=>setType(e.target.value)}>
              {settings.productTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Manage product types in Settings.</p>
          </div>
          <div className="form-group">
            <label>Available Colours (comma separated)</label>
            <input type="text" className="form-control" value={colours} onChange={e=>setColours(e.target.value)} placeholder="e.g. Red, Blue, Green"/>
          </div>
          <div className="form-group">
            <label>Available Sizes (comma separated)</label>
            <input type="text" className="form-control" required value={sizes} onChange={e=>setSizes(e.target.value)} placeholder="e.g. S, M, L, XL"/>
          </div>
          <div className="form-group">
            <label>Base Group Picture (Optional)</label>
            {uploading ? (
              <p style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>Uploading picture to cloud...</p>
            ) : image ? (
              <img src={image} alt="preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', display: 'block', marginBottom: '10px' }}/>
            ) : (
              <input type="file" className="form-control" accept="image/*" onChange={handleImage} />
            )}
          </div>
          <button type="submit" className="btn btn-primary" disabled={uploading}>Save Product</button>
        </form>
      </div>
    </div>
  );
}

// 3. Product Update Section
function ProductUpdate({ products, updateProduct, settings, deleteProduct }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  const fileRef = useRef(null);
  const mainImgRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);

  if (!product) return <div className="page-body">Product not found.</div>;

  const [activeTab, setActiveTab] = useState(product.sizesList?.[0] || 'Default');

  // Helper to get active stock data
  const currentData = product.stockData?.[activeTab] || { markers: [], image: product.image };

  const handleSaveData = (newData) => {
    updateProduct(id, {
      stockData: {
        ...(product.stockData || {}),
        [activeTab]: newData
      }
    });
  };

  const handleDeleteProduct = () => {
    if (window.confirm("Are you sure you want to completely delete this product?")) {
      deleteProduct(id);
      navigate('/');
    }
  };

  const handleDeleteSize = (sizeToDelete, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete size "${sizeToDelete}"?`)) {
      const newSizesList = product.sizesList.filter(s => s !== sizeToDelete);
      const newStockData = { ...product.stockData };
      delete newStockData[sizeToDelete];
      updateProduct(id, { sizesList: newSizesList, sizes: newSizesList.join(', '), stockData: newStockData });
      if (activeTab === sizeToDelete) setActiveTab(newSizesList[0] || 'Default');
    }
  };

  const handleDeleteColour = (colourToDelete) => {
    if (window.confirm(`Remove colour "${colourToDelete}"?`)) {
      const newColoursList = product.coloursList.filter(c => c !== colourToDelete);
      updateProduct(id, { coloursList: newColoursList, colours: newColoursList.join(', ') });
    }
  };

  const handleSaveClick = () => {
    alert(`Stock updated and synced to central cloud for ${activeTab}!`);
  };

  // Size-specific image upload
  const handleImgUpload = async (e) => {
    if (e.target.files[0]) {
      setUploading(true);
      try {
        const cloudUrl = await processAndUploadImage(e.target.files[0]);
        handleSaveData({ ...currentData, image: cloudUrl });
      } catch (err) { console.error("Upload failed:", err); }
      finally { setUploading(false); }
    }
  };

  const handleRemoveImage = () => {
    if (window.confirm("Remove this size-specific image?")) {
      handleSaveData({ ...currentData, image: null });
    }
  };

  // Main product cover image upload
  const handleMainImgUpload = async (e) => {
    if (e.target.files[0]) {
      setUploadingMain(true);
      try {
        const cloudUrl = await processAndUploadImage(e.target.files[0]);
        updateProduct(id, { image: cloudUrl });
      } catch (err) { console.error("Upload failed:", err); }
      finally { setUploadingMain(false); }
    }
  };

  const handleRemoveMainImage = () => {
    if (window.confirm("Remove the product cover image?")) {
      updateProduct(id, { image: null });
    }
  };

  return (
    <div className="page-body" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => navigate('/')}>Products</span>
            <ChevronRight size={16}/>
            {product.name}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage stock, sizes, colours and images for this product.</p>
        </div>
        <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleDeleteProduct}>
          <Trash2 size={16}/> Delete Product
        </button>
      </div>

      {/* Main Cover Image Section */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontWeight: 600 }}>Product Cover Image</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="file" ref={mainImgRef} style={{ display: 'none' }} accept="image/*" onChange={handleMainImgUpload} />
            {uploadingMain ? (
              <span style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>Uploading...</span>
            ) : product.image ? (
              <>
                <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => mainImgRef.current?.click()}><ImageIcon size={14}/> Change</button>
                <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleRemoveMainImage}><Trash2 size={14}/> Remove</button>
              </>
            ) : (
              <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => mainImgRef.current?.click()}><Upload size={14}/> Upload Cover</button>
            )}
          </div>
        </div>
        {product.image && (
          <img src={product.image} alt={product.name} style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
        )}
        {!product.image && (
          <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border)' }}>
            No cover image
          </div>
        )}
      </div>

      {/* Colours Section */}
      {product.coloursList && product.coloursList.length > 0 && (
        <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
          <span style={{ fontWeight: 600, display: 'block', marginBottom: '12px' }}>Colours <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.85rem' }}>(tap ✕ to remove)</span></span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {product.coloursList.map(colour => (
              <span key={colour} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: 'var(--accent)', borderRadius: '20px', padding: '4px 12px', fontWeight: 500, fontSize: '0.85rem', border: '1px solid #dbeafe' }}>
                {colour}
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center', padding: 0, lineHeight: 1 }}
                  onClick={() => handleDeleteColour(colour)}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Size Tabs */}
      <div className="tabs">
        {(product.sizesList || ['Default']).map(size => (
          <div
            key={size}
            className={`tab-item ${activeTab === size ? 'active' : ''}`}
            onClick={() => setActiveTab(size)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            Size: {size}
            <button
              style={{ background: 'none', border: 'none', color: activeTab === size ? 'white' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
              onClick={(e) => handleDeleteSize(size, e)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Size-specific image controls */}
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
        <input type="file" ref={fileRef} style={{ display: 'none' }} accept="image/*" onChange={handleImgUpload} />
        {uploading ? (
          <span style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>Uploading image...</span>
        ) : !currentData.image ? (
          <button className="btn btn-outline" onClick={() => fileRef.current?.click()}><Upload size={16}/> Upload Size Image</button>
        ) : (
          <>
            <button className="btn btn-outline" onClick={() => fileRef.current?.click()}><ImageIcon size={16}/> Change Image</button>
            <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleRemoveImage}><Trash2 size={16}/> Remove Image</button>
          </>
        )}
      </div>

      <TickerInterface
        key={activeTab}
        image={currentData.image}
        markers={currentData.markers || []}
        setMarkers={(m) => handleSaveData({ ...currentData, markers: m })}
        onSave={handleSaveClick}
        title={`${activeTab} Variants`}
        markerStyle={settings.markerStyle}
        availableColours={product.coloursList}
      />
    </div>
  );
}

// 4. Daily Updates (List)
function DailyUpdatesList({ sections, addSection }) {
  const navigate = useNavigate();
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if(!newTitle.trim()) return;
    addSection(newTitle);
    setNewTitle('');
  };

  return (
    <div className="page-body">
      <h2>Daily Updates</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Manage your daily stock check sections here.</p>
      
      <div className="card" style={{ marginBottom: '30px', maxWidth: '600px' }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="New section name (e.g. XXL Polos)..." 
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Add Section</button>
        </form>
      </div>

      <div className="grid-3">
        {sections.map(section => (
          <div key={section.id} className="card card-clickable" onClick={() => navigate(`/daily-updates/${section.id}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem' }}>{section.title}</h3>
              <ChevronRight size={20} color="var(--accent)" />
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
              {section.markers?.length || 0} variants logged
            </p>
          </div>
        ))}
      </div>
      {sections.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No daily updates added yet.</p>}
    </div>
  );
}

// 5. Daily Update Subpage (Detail)
function DailyUpdateDetail({ sections, updateSection, settings }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const section = sections.find(s => s.id === id);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  if (!section) return <div className="page-body">Section not found.</div>;

  const handleSave = () => {
    alert(`Saved daily update for ${section.title} to central cloud!`);
    navigate('/daily-updates');
  };

  const handleImgUpload = async (e) => {
    if (e.target.files[0]) {
      setUploading(true);
      try {
        const cloudUrl = await processAndUploadImage(e.target.files[0]);
        updateSection(id, { image: cloudUrl });
      } catch (err) {
        console.error("Cloud image upload failed:", err);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="page-body" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => navigate('/daily-updates')}>Daily Updates</span> 
            <ChevronRight size={16}/> 
            {section.title}
          </h2>
        </div>
        {uploading ? (
          <span style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>Uploading image...</span>
        ) : !section.image && (
          <div>
            <input type="file" ref={fileRef} style={{ display: 'none' }} accept="image/*" onChange={handleImgUpload} />
            <button className="btn btn-outline" onClick={() => fileRef.current?.click()}><Upload size={16}/> Upload Image</button>
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <TickerInterface 
          image={section.image}
          markers={section.markers || []}
          setMarkers={(m) => updateSection(id, { markers: m })}
          onSave={handleSave}
          title={section.title}
          markerStyle={settings.markerStyle}
          availableColours={[]} 
        />
      </div>
    </div>
  );
}

// 6. Settings Page
function SettingsPage({ settings, updateSettings }) {
  const [newType, setNewType] = useState('');

  const handleAddType = (e) => {
    e.preventDefault();
    if(newType.trim() && !settings.productTypes.includes(newType.trim())) {
      updateSettings({ productTypes: [...settings.productTypes, newType.trim()] });
      setNewType('');
    }
  };

  const handleRemoveType = (type) => {
    updateSettings({ productTypes: settings.productTypes.filter(t => t !== type) });
  };

  return (
    <div className="page-body">
      <h2>Settings</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Manage application preferences here.</p>
      
      <div className="card" style={{ maxWidth: '600px', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '20px' }}>Product Types</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
          Add or remove categories available when adding a new product.
        </p>
        
        <form onSubmit={handleAddType} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            className="form-control"
            placeholder="New type (e.g. Hoodies)..."
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Add</button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {settings.productTypes.map(t => (
            <div key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>
              {t}
              <button onClick={() => handleRemoveType(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                <XIcon />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '20px' }}>Visual Settings</h3>
        
        <div className="form-group">
          <label>Marker Display Style</label>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Choose whether to show numbers or visual tick marks on the product images when you click.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
              <input 
                type="radio" 
                name="markerStyle" 
                value="numbers" 
                checked={settings.markerStyle === 'numbers'}
                onChange={() => updateSettings({ markerStyle: 'numbers' })}
              />
              Number Marks (1, 2, 3...)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
              <input 
                type="radio" 
                name="markerStyle" 
                value="ticks" 
                checked={settings.markerStyle === 'ticks'}
                onChange={() => updateSettings({ markerStyle: 'ticks' })}
              />
              Tick Marks (✔️)
            </label>
          </div>
        </div>

        <hr style={{ margin: '30px 0', borderColor: 'var(--border)' }} />

        <h3 style={{ marginBottom: '20px' }}>Data Management</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Download all your stock information as a CSV file.</p>
        <button className="btn btn-outline" onClick={() => alert('Exporting data... (Demo)')}>Export to CSV</button>
      </div>
    </div>
  );
}

// Simple internal icon for X
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

// --- Main App Shell ---
export default function App() {
  const [settings, setSettings] = useState({
    markerStyle: 'ticks',
    productTypes: ['Joggers', 'Polos', 'T-Shirts', 'Shorts', 'Jeans', 'Accessories']
  });

  // Start with empty arrays — Firebase will populate immediately
  const [products, setProducts] = useState([]);
  const [dailySections, setDailySections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);

  // Real-time Central Cloud Subscriptions
  useEffect(() => {
    let productsLoaded = false;
    let dailyLoaded = false;

    const checkAllLoaded = () => {
      if (productsLoaded && dailyLoaded) setLoading(false);
    };

    const unsubProducts = subscribeProducts((cloudProducts) => {
      // Always replace with cloud data (even empty array = real state from Firebase)
      setProducts(cloudProducts || []);
      productsLoaded = true;
      checkAllLoaded();
    });

    const unsubDaily = subscribeDailySections((cloudSections) => {
      setDailySections(cloudSections || []);
      dailyLoaded = true;
      checkAllLoaded();
    });

    const unsubSettings = subscribeSettings((cloudSettings) => {
      if (cloudSettings && Object.keys(cloudSettings).length > 0) {
        setSettings(prev => ({ ...prev, ...cloudSettings }));
      }
    });

    // Safety timeout — if Firebase doesn't respond in 8s, stop loading spinner
    const timeout = setTimeout(() => setLoading(false), 8000);

    return () => {
      unsubProducts();
      unsubDaily();
      unsubSettings();
      clearTimeout(timeout);
    };
  }, []);


  const addProduct = (prod) => {
    setProducts(prev => [...prev, prod]);
    saveProductToCloud(prod);
  };

  const deleteProduct = (id) => {
    if (window.confirm("Are you sure you want to completely delete this product?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
      deleteProductFromCloud(id);
    }
  };

  const updateProduct = (id, data) => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...data } : p);
      const target = updated.find(p => p.id === id);
      if (target) saveProductToCloud(target);
      return updated;
    });
  };

  const addDailySection = (title) => {
    const newSection = { id: uuidv4(), title, image: null, markers: [] };
    setDailySections(prev => [newSection, ...prev]);
    saveDailySectionToCloud(newSection);
  };

  const updateDailySection = (id, data) => {
    setDailySections(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...data } : s);
      const target = updated.find(s => s.id === id);
      if (target) saveDailySectionToCloud(target);
      return updated;
    });
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettingsToCloud(updated);
      return updated;
    });
  };

  return (
    <Router>
      <div className="app-layout">
        {/* Mobile overlay backdrop */}
        {navOpen && (
          <div
            className="nav-overlay"
            onClick={() => setNavOpen(false)}
          />
        )}

        {/* Navigation Sidebar */}
        <nav className={`app-nav${navOpen ? ' nav-open' : ''}`}>
          <div className="nav-brand">
            FashionFusion
            <button className="nav-close-btn" onClick={() => setNavOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="nav-links">
            <NavLink to="/" icon={<Package size={18}/>} onNavigate={() => setNavOpen(false)}>Products List</NavLink>
            <NavLink to="/add-product" icon={<PlusSquare size={18}/>} onNavigate={() => setNavOpen(false)}>Add Product</NavLink>
            <NavLink to="/daily-updates" icon={<Calendar size={18}/>} onNavigate={() => setNavOpen(false)}>Daily Updates</NavLink>
          </div>
          
          <div className="nav-links" style={{ flex: 'none', marginTop: 'auto' }}>
            <NavLink to="/settings" icon={<SettingsIcon size={18}/>} onNavigate={() => setNavOpen(false)}>Settings</NavLink>
          </div>
        </nav>

        {/* Content Area */}
        <main className="app-content">
          {/* Mobile Top Bar */}
          <div className="mobile-topbar">
            <button className="hamburger-btn" onClick={() => setNavOpen(true)}>
              <Menu size={22} />
            </button>
            <span className="mobile-brand">FashionFusion</span>
          </div>
          {loading ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: '16px', color: 'var(--text-muted)'
            }}>
              <div style={{
                width: '40px', height: '40px',
                border: '3px solid var(--border)',
                borderTopColor: 'var(--accent)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <p style={{ fontWeight: 500 }}>Syncing data from cloud...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<ProductsList products={products} settings={settings} deleteProduct={deleteProduct} />} />
              <Route path="/add-product" element={<AddProduct onAdd={addProduct} settings={settings} />} />
              <Route path="/product/:id" element={<ProductUpdate products={products} updateProduct={updateProduct} settings={settings} deleteProduct={deleteProduct} />} />
              
              <Route path="/daily-updates" element={<DailyUpdatesList sections={dailySections} addSection={addDailySection} />} />
              <Route path="/daily-updates/:id" element={<DailyUpdateDetail sections={dailySections} updateSection={updateDailySection} settings={settings} />} />
              
              <Route path="/settings" element={<SettingsPage settings={settings} updateSettings={updateSettings} />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

function NavLink({ to, icon, children, onNavigate }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/' && location.pathname.startsWith('/product/')) || (to === '/daily-updates' && location.pathname.startsWith('/daily-updates/'));
  return (
    <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`} onClick={onNavigate}>
      {icon} {children}
    </Link>
  );
}

