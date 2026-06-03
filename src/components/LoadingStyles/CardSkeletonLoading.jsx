import React from "react";
import { Box, Skeleton } from "@mui/material";

const CARD_MIN_HEIGHT = 210;
const CARD_RADIUS = "18px";
const CARD_SHADOW = "0 4px 24px rgba(25,118,210,0.08), 0 1px 4px rgba(0,0,0,0.04)";

const CardSkeletonItem = () => (
 <Box
  sx={{
   borderRadius: CARD_RADIUS,
   background: "rgba(255,255,255,0.92)",
   backdropFilter: "blur(12px)",
   border: "1px solid rgba(255,255,255,0.7)",
   boxShadow: CARD_SHADOW,
   minHeight: CARD_MIN_HEIGHT,
   height: "100%",
   display: "flex",
   flexDirection: "column",
   overflow: "hidden",
  }}
 >
  <Box sx={{ p: "20px 20px 0 20px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
   <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
    <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: "14px" }} />
    <Skeleton variant="circular" width={24} height={24} />
   </Box>
   <Skeleton variant="text" width="45%" height={12} sx={{ mb: 1, borderRadius: "4px" }} />
   <Skeleton variant="text" width="75%" height={32} sx={{ mb: 0.5, borderRadius: "6px" }} />
   <Skeleton variant="text" width="55%" height={12} sx={{ mb: 2, borderRadius: "4px" }} />
  </Box>
  <Box sx={{ px: "20px", pb: "14px", flexShrink: 0 }}>
   <Skeleton variant="rounded" width="100%" height={32} sx={{ borderRadius: "6px" }} />
  </Box>
 </Box>
);

const CardSkeletonLoading = ({ count = 9, columns = 3 }) => {
 const colCalc = `calc(${100 / columns}% - 16px)`;

 return (
  <Box
   sx={{
    display: "flex",
    flexDirection: { xs: "column", sm: "row" },
    flexWrap: "wrap",
    gap: 2,
    mb: 2,
    width: "100%",
    alignItems: "stretch",
   }}
  >
   {[...Array(count)].map((_, i) => (
    <Box key={i} sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 16px)", md: `1 1 ${colCalc}` }, minWidth: 0 }}>
     <CardSkeletonItem />
    </Box>
   ))}
  </Box>
 );
};

export { CardSkeletonItem };
export default React.memo(CardSkeletonLoading);
