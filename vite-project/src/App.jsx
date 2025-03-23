import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Modal } from 'bootstrap'; // 引入 Bootstrap Modal

const API_BASE = "https://ec-course-api.hexschool.io/v2";
const API_PATH = "test886";


function App() {
  // 宣告一個預設的 Modal 狀態
  const defaultModalState = {
    id: "",
    imageUrl: "",
    title: "",
    category: "",
    unit: "",
    origin_price: "",
    price: "",
    description: "",
    content: "",
    is_enabled: 0,
    imagesUrl: [""]
  };

  const productModalRef = useRef(null); // 用 useRef 去抓取產品 Modal 的 DOM 元素
  const delProductModalRef = useRef(null); //  用 useRef 去抓取刪除產品 Modal 的 DOM 元素
  const [modalMode, setModalMode] = useState(null); // 為了讓我們可以判斷是新增產品還是編輯產品，我們需要宣告一個 modalMode 的狀態
  const [tempProduct, setTempProduct] = useState(defaultModalState); // tempProduct 是原先 Week 2 主線任務中通過「查看細節」按鈕查看「產品資料」資料狀態的函式，Week 3 主線任務中我們已刪除所以不做使用，所以這邊改用做 modal 的狀態(defaultModalState)

  const [account, setAccount] = useState({
    "username": "example@test.com",
    "password": "example"
  })

  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    console.log("call useEffect:", modalMode);
  }, [modalMode]);

  const checkUserLogin = () => {
    axios.post(`${API_BASE}/api/user/check`)
      .then((response) => {
        setIsAuth(true) // 因為我們把檢查用戶是否已經登陸的按鈕刪除了，所以改用 setIsAuth(true) 來判斷用戶是否已經登陸
        getProducts(); // 若用戶已經登陸，則執行 getProducts() 來抓取產品資料
      })
      .catch((error) => console.error(error)
      )
  }

  const getProducts = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`
      );
      setProducts(response.data.products);
    } catch (error) {
      console.error(error.response.data.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, account);
      const { token, expired } = response.data;
      document.cookie = `AwesomeToken=${token}; expires=${new Date(expired)}`;

      axios.defaults.headers.common['Authorization'] = token;

      getProducts();

      setIsAuth(true);
      console.log(response);
    } catch (error) {
      alert("登入失敗：" + error.response.data.message);
    }
  };
  // 在登錄頁面渲染的時候去呼叫 checkUserLogin 進而抓取產品資料，因為我們把檢查用戶是否已經登陸的按鈕刪除了，所以改用 checkUserLogin 來判斷用戶是否已經登陸

  const handleInputChange = (e) => {
    const { value, name } = e.target;
    setAccount({
      ...account,
      [name]: value
    })
    // console.log(account);
  }

  // 通過 useEffect 在登錄頁面渲染的時候去呼叫 checkUserLogin 進而抓取產品資料
  useEffect(() => {
    // Step 1: 如果我們上面有把 token 存到 cookie 裡的話，就可以用下面的方式來抓取 token，token 中含有用戶的登陸資訊 (帳號 & 密碼），token 的名稱我們前面設定為 AwesomeToken)
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)AwesomeToken\s*\=\s*([^;]*).*$)|^.*$/,
      "$1",
    );

    axios.defaults.headers.common['Authorization'] = token; // Step 2: 把 token 存到 axios 的 headers 裡

    checkUserLogin(); // Step 3: 呼叫 checkUserLogin

    productModalRef.current = new Modal("#productModal", { 
      keyboard: false,
      backdrop: false
    });

    delProductModalRef.current = new Modal("#delProductModal", {
      keyboard: false,
      backdrop: false
    })
  }, []) // Step 4: 記得附上一個空陣列 []；Alternatively, 陣列裡面可以寫入 useEffect 的依賴變數，也就是代表 useEffect 會在這個依賴變數改變的時候被觸發。如果我們留一個空陣列 [],就是代表 useEffect 會在整個網頁首次渲染的時候被觸發一次後就停止！

  // 宣告 handleOpenModal 函式，用來「OPEN」產品 Modal （必須在 dom 元素綁定 onClick 事件觸發這個函式）
  // 設定當用戶點擊 「新增產品」或者是「編輯產品」的按鈕時，通過傳入 mode 這個參數來判斷要開啟新增產品 Modal 還是編輯產品 Modal
  const handleOpenProductModal = (mode, product) => {
    setModalMode(mode); // 將 modalMode 的狀態設定為 mode

    // 根據 mode 的值來判斷要開啟新增產品 Modal 還是編輯產品 Modal；這邊我們使用 switch 而不是 if eles，因為當 condition 比較簡易時，switch 的效能比較好，也比較好管理，而如果 condition 比較複雜時，應該使用 if else
    switch (mode) {
      case 'create':
        setTempProduct(defaultModalState);
        break;

      case 'edit':
        setTempProduct(product);
        console.log(tempProduct);
        break;
    }

    productModalRef.current.show(); // 開啟產品 Modal
  }

  // 宣告 handleCloseModal 函式，用來開啟「CLOSE」產品Modal （必須在 dom 元素綁定 onClick 事件觸發這個函式）
  const handleCloseProductModal = () => {
    productModalRef.current.hide(); // 開啟產品 Modal
  }

  // 宣告 handleOpenDelProductModal 函式，用來「OPEN」刪除產品 Modal，記得綁定到刪除產品的按鈕上！
  const handleOpenDelProductModal = (product) => {
    setTempProduct(product); // 將要刪除的產品資料 (product) 傳入到 tempProduct 的狀態；再將 tempProduct 的狀態傳入到刪除產品 Modal，這樣刪除產品 Modal 就會顯示要刪除的產品資料
    delProductModalRef.current.show(); // 開啟刪除產品 Modal
  }

  // 宣告 handleCloseDelProductModal 函式，用來「CLOSE」刪除產品 Modal，記得綁定到刪除產品的按鈕上！
  const handleCloseDelProductModal = () => {
    delProductModalRef.current.hide(); // 開啟刪除產品 Modal
  }

  // 通過 handleModalInputChange 更新產品 Modal 的狀態，設定完狀態就要去 return 的 html 結構中綁定對應的 dom 元素
  const handleModalInputChange = (e) => {
    const { name, value, checked, type } = e.target; // name 是 input 元素的 name 屬性值，value 是 input 元素的 value 屬性值，checked 是 checkbox 元素的 checked 屬性值，type 是 input 元素的 type 屬性值(增加 type 是為了判斷是否為 checkbox)
    setTempProduct({
      ...tempProduct, // 展開原先的 tempProduct
      [name]: type === "checkbox" ? checked : value // 通過 name 屬性來更新對應的值；如果 name 是 checkbox 就用 checked ,否則就用 value 
    });
  }

  // 通過 handleImageChange 讓用戶可以編輯更新副圖的網址連結
  const handleImageChange = (e, index) => {
    const { value } = e.target; // value 是要上傳圖片的網址
    const newImages = [...tempProduct.imagesUrl]; // 將副圖的網址傳入到一個新的陣列中
    newImages[index] = value; // 將上傳圖片的網址傳入到新的陣列中；傳入 index 參數是為了將上傳圖片的網址傳入到對應的副圖的位置，[0] 代表第一張副圖，[1] 代表第二張副圖，以此類推
    setTempProduct({
      ...tempProduct, // 展開原先的 tempProduct
      imagesUrl: newImages // 將上傳圖片的網址傳入到 tempProduct 副圖的 imagesUrl 屬性
    })
  }

  // 通過 handleAddImage 讓用戶可以新增副圖
  const handleAddImage = () => {
    const newImages = [...tempProduct.imagesUrl, ''];

    setTempProduct({ // 將副圖的網址傳入到一個新的陣列中
      ...tempProduct, // 展開原先的 tempProduct
      imagesUrl: newImages // 將副圖的網址傳入到 tempProduct 副圖的 imagesUrl 屬性
    })
  }

  // 通過 handleRemoveImage 讓用戶可以刪除副圖
  const handleRemoveImage = (index) => {
    const newImages = [...tempProduct.imagesUrl];

    // 刪除副圖（常見刪除資料的方法有兩種：splice() 和 pop()）
    // newImages.splice(index, 1); // splice() 可以移除指定位置、指定數量的陣列值
    newImages.pop(); // pop() 則是移除最後一個陣列值，因為 modal 只能刪除最後一個副圖，所以這邊使用 pop()

    setTempProduct({ // 將副圖的網址傳入到一個新的陣列中
      ...tempProduct, // 展開原先的 tempProduct
      imagesUrl: newImages // 將副圖的網址傳入到 tempProduct 副圖的 imagesUrl 屬性
    })
  }

  // 通過 createProduct 新增產品
  const createProduct = async () => {
    try {
      await axios.post(`${API_BASE}/api/${API_PATH}/admin/product`, {
        data: {
          ...tempProduct,
          origin_price: Number(tempProduct.origin_price), // 將「原價」和「售價」用 Number() 將原本 API 資料集中的字串轉換成數字
          price: Number(tempProduct.price),
          is_enabled: tempProduct.is_enabled ? 1 : 0 // 
        }

      });
    } catch (error) {
      alert('新增產品失敗:' + error.response.data.message);
    }
  }

  // 通過 updateProduct 編輯產品
  const updateProduct = async () => {

    try {
      // 編輯產品的 axios 指令改成 push (常見的 5 種 axios 指令如下，請牢記：post、get、put、delete，patch 分別代表「新增」、「讀取」、「編輯」、「刪除」、「部分更新」，詳情請參考：https://ihower.tw/blog/archives/6483)
      await axios.put(`${API_BASE}/api/${API_PATH}/admin/product/${tempProduct.id}`, {
        data: {
          ...tempProduct,
          origin_price: Number(tempProduct.origin_price), // 將「原價」和「售價」用 Number() 將原本 API 資料集中的字串轉換成數字
          price: Number(tempProduct.price), // 同上
          is_enabled: tempProduct.is_enabled ? 1 : 0  // 1 代表啟用，0 代表未啟用
        }

      });
    } catch (error) {
      alert('編輯產品失敗:' + error.response.data.message);
    }
  }

// 添加：宣告一個 handleUpdateProduct 的函式將「新增」or「編輯」後通過點擊 modal 的「確認」按鈕觸發 re-render，將「新增」or「編輯」後的資料渲染到網頁上
const handleUpdateProduct = async () => {

    // 判斷是新增產品、編輯產品還是刪除產品
    const apiCall = modalMode === 'create' ? createProduct : updateProduct;

    try {
      await apiCall(); // 執行 apiCall, 用 apiCall 來判斷是新增產品還是編輯產品；這邊要 await apiCall（新增產品），因為要確定成功新增產品後才應該讓用戶可以通過點擊「確認」按鈕自行關閉 Modal

      getProducts(); // 注意：更新資料或關閉資料不需要 await，因為我們不需要等執行完 getProducts (讀取產品列表) 後才執行 handleCloseProductModal (關閉產品 Modal)

      handleCloseProductModal(); // 讓用戶點擊「確認」按鈕後關閉產品 Modal

    } catch (error) {
      alert('更新產品失敗:' + error.response.data.message);
    }
  }

  // 刪除產品
  const handleDelProduct = async () => {
    try {
      await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${tempProduct.id}`);
      getProducts();
      handleCloseDelProductModal();
    } catch (error) {
      alert('刪除產品失敗:' + error.response.data.message);
    }
  }

  return (
    <>
      {isAuth ? (<div className="container">
        <div className="row mt-5">
          <div className="col">
            <div className="d-flex justify-content-between">
              <h2>即將上映</h2>
              <button onClick={() => handleOpenProductModal('create')} type="button" className="btn btn-primary">建立新的產品</button> {/* 通過 onClick 事件觸發 handleOpenModal，並傳入 "create" 這個參數，因為我們這邊是要新增產品 */}
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">產品名稱</th>
                  <th scope="col">原價</th>
                  <th scope="col">售價</th>
                  <th scope="col">是否啟用</th>
                  <th scope="col"></th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <th scope="row">{product.title}</th>
                    <td>{product.origin_price}</td>
                    <td>{product.price}</td>
                    <td>{product.is_enabled ? (<span className="text-success">已啟用</span>) : <span className="text-danger">未啟用</span>}</td>
                    <td>
                      <div className="btn-group">
                        <button onClick={() => handleOpenProductModal('edit', product)} type="button" className="btn btn-outline-primary btn-sm">編輯</button> {/* 通過 onClick 事件觸發 handleOpenModal，並傳入 "edit" 這個參數，因為我們這邊是要新增產品 */}
                        <button onClick={() => handleOpenDelProductModal(product)} type="button" className="btn btn-outline-danger btn-sm">刪除</button> {/* 通過 onClick 事件觸發 handleOpenDelModal */}
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          const updatedProducts = products.map((p) =>
                            p.id === product.id
                              ? { ...p, is_enabled: !p.is_enabled }
                              : p
                          );
                          setProducts(updatedProducts);
                        }}
                      >
                        轉換啟用狀態
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>) : (<div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <h1 className="mb-5">請先登入</h1>
        <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
          <div className="form-floating mb-3">
            <input onChange={handleInputChange} name="username" value={account.username} type="email" className="form-control" id="username" placeholder="name@example.com" />
            <label htmlFor="username">Email address</label>
          </div>
          <div className="form-floating">
            <input onChange={handleInputChange} name="password" value={account.password} type="password" className="form-control" id="password" placeholder="Password" />
            <label htmlFor="password">Password</label>
          </div>
          <button className="btn btn-primary">登入</button>
        </form>
        <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
      </div>)}


      <div ref={productModalRef} id="productModal" className="modal" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}> {/* 綁定 ref 在 Modal 元素 */}
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fs-4">{modalMode === "create" ? "新增產品" : "編輯產品"}</h5> {/* 通過傳入 modalMode 的狀態參數 (create 或 edit) 來決定 Modal 是判斷 modal 的標題是顯示「新增產品」還是「編輯產品」*/}
              <button onClick={handleCloseProductModal} type="button" className="btn-close" aria-label="Close"></button> {/* 通過 onClick 事件觸發 handleCloseModal 讓用戶可以通過點擊 modal（彈跳視窗) 的「x」關閉產品 Modal */}
            </div>

            <div className="modal-body p-4">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="mb-4">
                    <label htmlFor="primary-image" className="form-label">
                      主圖
                    </label>
                    <div className="input-group">
                      <input
                        value={tempProduct.imageUrl} // 設定產品的圖片連結
                        onChange={handleModalInputChange} // 通過 onChange 事件來更新圖片連結
                        name="imageUrl"
                        type="text"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                      />
                    </div>
                    <img
                      src={tempProduct.imageUrl || null} // 將圖片的 src 屬性設定為產品的圖片連結； 如果圖片連結為空,則設定為 null，不然畫面上會出現空的圖片（basically 一個顯示 
                      alt={tempProduct.title} // 將圖片的 alt 屬性設定為產品的標題
                      className="img-fluid"
                    />
                  </div>

                  {/* 副圖 */} {/* 副圖先不用設定！等設定完「新增產品」&「編輯產品」功能後再來設定 */}
                  <div className="border border-2 border-dashed rounded-3 p-3">
                    {tempProduct.imagesUrl?.map((image, index) => (
                      <div key={index} className="mb-2">
                        <label
                          htmlFor={`imagesUrl-${index + 1}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          value={image} // 將副圖的值設定為產品的副圖
                          onChange={(e) => handleImageChange(e, index)} // 通過 onChange 事件來更新副圖的值，e 代表事件物件, index 代表副圖的索引 
                          id={`imagesUrl-${index + 1}`}
                          type="text"
                          placeholder={`圖片網址 ${index + 1}`}
                          className="form-control mb-2"
                        />
                        {image && (
                          <img
                            src={image}
                            alt={`副圖 ${index + 1}`}
                            className="img-fluid mb-2"
                          />
                        )}
                      </div>
                    ))}

                    <div className="btn-group w-100">
                      {/* 通過條件判斷來決定是否顯示新增圖片的按鈕：如果圖片數量小於 5 且「圖片網址」不是空值（空字串），就顯示新增圖片的按鈕 / 如果圖片數量已有 5 張或「圖片網址」是空值（空字串），就不顯示新增圖片的按鈕 */}
                      {tempProduct.imagesUrl.length < 5 &&
                        tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1] !== '' &&
                        (<button onClick={handleAddImage} className="btn btn-outline-primary btn-sm w-100">新增圖片</button>)}

                      {tempProduct.imagesUrl.length > 1 &&
                        (<button onClick={handleRemoveImage} className="btn btn-outline-danger btn-sm w-100">取消圖片</button>)}
                    </div>

                  </div>
                </div>

                <div className="col-md-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      value={tempProduct.title} // 將標題的值設定為產品的標題
                      onChange={handleModalInputChange} // 通過 handleModalInputChange 更新產品 Modal 的狀態
                      name="title"
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      分類
                    </label>
                    <input
                      value-={tempProduct.category} // 將分類的值設定為產品的分類
                      onChange={handleModalInputChange} // 通過 handleModalInputChange 更新產品 Modal 的狀態
                      name="category"
                      id="category"
                      type="text"
                      className="form-control"
                      placeholder="請輸入分類"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">
                      單位
                    </label>
                    <input
                      value={tempProduct.unit} // 將單位的值設定為產品的單位
                      onChange={handleModalInputChange} // 通過 handleModalInputChange 更新產品 Modal 的狀態
                      name="unit"
                      id="unit"
                      type="text"
                      className="form-control"
                      placeholder="請輸入單位"
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        value={tempProduct.origin_price} // 將原價的值設定為產品的原價
                        onChange={handleModalInputChange} // 通過 handleModalInputChange 更新產品 Modal 的狀態
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入原價"
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        value={tempProduct.price} // 將售價的值設定為產品的售價
                        onChange={handleModalInputChange} // 通過 handleModalInputChange 更新產品 Modal 的狀態
                        name="price"
                        id="price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入售價"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      value={tempProduct.description} // 將產品描述的值設定為產品的產品描述
                      onChange={handleModalInputChange} // 通過 handleModalInputChange 更新產品 Modal 的狀態
                      name="description"
                      id="description"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入產品描述"
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      value={tempProduct.content} // 將說明內容的值設定為產品的說明內容
                      onChange={handleModalInputChange} // 通過 handleModalInputChange 更新產品 Modal 的狀態
                      name="content"
                      id="content"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入說明內容"
                    ></textarea>
                  </div>

                  <div className="form-check">
                    <input
                      checked={tempProduct.is_enabled} // 將是否啟用的值設定為產品的是否啟用；；但是，這邊注意，handleInputChange 無法直接更新 is_enabled 的值，因為它是一個 boolean 值（true 或 false），所以要用 checked prop (屬性) 來更新，所以這邊不能用 value 屬性而使用 checked 屬性，同時也要在 handleModalInputChange 中加上 checked 屬性！
                      onChange={handleModalInputChange} // 通過 handleModalInputChange 更新產品 Modal 的狀態
                      name="is_enabled"
                      type="checkbox"
                      className="form-check-input"
                      id="isEnabled"
                    />
                    <label className="form-check-label" htmlFor="isEnabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light">
              <button onClick={handleCloseProductModal} type="button" className="btn btn-secondary"> {/* 宣告 handleCloseProductModal 函式，用來關閉「關閉 產品Modal」 */}
                取消
              </button>
              <button onClick={handleUpdateProduct} type="button" className="btn btn-primary"> {/* 宣告 handleUpdateProduct 函式，用來更新「新增/編輯/刪除 產品Modal」 */}
                確認
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={delProductModalRef}
        className="modal fade"
        id="delProductModal"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
                onClick={handleCloseDelProductModal}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              你是否要刪除
              <span className="text-danger fw-bold">{tempProduct.title}</span>
            </div>
            <div className="modal-footer">
              <button
                onClick={handleCloseDelProductModal}
                type="button"
                className="btn btn-secondary"
              >
                取消
              </button>
              <button onClick={handleDelProduct} type="button" className="btn btn-danger">
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
