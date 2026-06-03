import React from 'react';
import {
    Grid, Card, CardContent, Typography,
    Avatar, Box, Badge, CardActionArea
} from '@mui/material';
import {
    FolderSpecial as FolderIcon,
    People as PeopleIcon
} from '@mui/icons-material';

const LIVER_CATEGORIES = [
    'Viral (Infectious) Liver Diseases',
    'Metabolic & Fatty Liver Diseases',
    'Alcohol-Related Liver Diseases',
    'Autoimmune Liver Diseases',
    'Genetic / Hereditary Liver Disorders',
    'Drug-Induced & Toxic Liver Injury',
    'Vascular Liver Diseases',
    'Chronic Liver Disease & Complications',
    'Liver Failure',
    'Liver Cancer'
];

interface LiverCategoryListProps {
    counts: Record<number, number>;
    onSelect: (category: number) => void;
}

const LiverCategoryList: React.FC<LiverCategoryListProps> = ({ counts, onSelect }) => {
    return (
        <Grid container spacing={3}>
            {LIVER_CATEGORIES.map((name, index) => {
                const categoryId = index + 1;
                const count = counts[categoryId] || 0;

                return (
                    <Grid item xs={12} sm={6} md={4} lg={2.4} key={categoryId}>
                        <Card
                            sx={{
                                height: '100%',
                                borderRadius: 4,
                                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                '&:hover': {
                                    transform: 'translateY(-10px)',
                                    boxShadow: '0 12px 30px rgba(26, 35, 126, 0.15)',
                                    bgcolor: 'primary.light',
                                    '& .icon-box': { bgcolor: 'white', color: 'primary.main' },
                                    '& .category-title': { color: 'white' },
                                    '& .count-text': { color: 'white' }
                                }
                            }}
                        >
                            <CardActionArea
                                onClick={() => onSelect(categoryId)}
                                sx={{ height: '100%', p: 3 }}
                            >
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                    <Avatar
                                        className="icon-box"
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            bgcolor: 'primary.main',
                                            mb: 2,
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <FolderIcon fontSize="large" />
                                    </Avatar>
                                    <Typography
                                        variant="subtitle2"
                                        className="category-title"
                                        sx={{
                                            fontWeight: 'bold',
                                            height: 40,
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            lineHeight: 1.2
                                        }}
                                    >
                                        {name}
                                    </Typography>
                                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PeopleIcon fontSize="small" color="disabled" className="count-icon" />
                                        <Typography variant="caption" fontWeight="bold" className="count-text">
                                            {count} Patients
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardActionArea>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
};

export default LiverCategoryList;
export { LIVER_CATEGORIES };
