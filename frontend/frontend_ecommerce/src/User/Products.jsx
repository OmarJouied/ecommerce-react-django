import Product from '../Main/Product';

function Products({ array, setData, setForm, setItem }) {
  return (
    <div className='ecommerce__user-products'>
        {
            array?.map(item => <Product key={item.id} item={item} setData={setData} setForm={setForm} setItem={setItem} />)
        }
    </div>
  )
}

export default Products;