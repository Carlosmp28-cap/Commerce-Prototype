
import { Button, styled } from "@mui/material";

interface CustomButtonProps {
  size?: "small" | "medium" | "large";
  variantType?: "primary" | "secondary" | "danger";
}

const CustomButton = styled(Button)<CustomButtonProps>(
  ({ theme, size = "medium", variantType = "primary" }) => {
    const sizeStyles = {
      small: {
        padding: theme.spacing(0.5, 1.5),
        fontSize: "0.8rem",
      },
      medium: {
        padding: theme.spacing(1, 2),
        fontSize: "1rem",
      },
      large: {
        padding: theme.spacing(1.5, 3),
        fontSize: "1.2rem",
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: theme.palette.primary.main,
        color: "#fff",
      },
      secondary: {
        backgroundColor: theme.palette.grey[500],
        color: "#fff",
      },
      danger: {
        backgroundColor: theme.palette.error.main,
        color: "#fff",
      },
    };

    return {
      borderRadius: 10,
      ...sizeStyles[size],
      ...variantStyles[variantType],
      "&:hover": {
        opacity: 0.9,
      },
    };
  }
);

export default CustomButton;
