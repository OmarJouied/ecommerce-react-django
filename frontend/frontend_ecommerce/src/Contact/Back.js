function Back({ back }) {
  return (
      <button
        onClick={back}
        style={{
            padding: ".75em 1.5em",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
            // border: 0,
            // borderRadius: '4px'
        }}>
          <i className='fa-arrow-left-long fa'></i>
            back
        </button>
  )
}

export default Back;