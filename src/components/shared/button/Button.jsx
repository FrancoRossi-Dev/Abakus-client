const Button = ({ type, label, onClick }) => {
  return (
    <button className={type} onClick={onClick}>
      {label}
    </button>
  );
};

export default Button;
