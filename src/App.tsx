import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

function App() {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Header area - will contain timer and volume control */}
      <Box
        component="header"
        sx={{
          py: { xs: 1, sm: 2 },
          px: { xs: 2, sm: 3 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h4"
          color="primary"
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
          }}
        >
          Rosie Races
        </Typography>
      </Box>

      {/* Main game area - will contain Phaser canvas */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 2 },
          minHeight: 0, // Allows flex child to shrink
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Placeholder for game canvas */}
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: 600, md: 800, lg: 1024 },
              aspectRatio: '4/3',
              bgcolor: '#4CAF50', // Grass green placeholder
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 3,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
              }}
            >
              Game coming soon!
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Footer area - will contain TAP button */}
      <Box
        component="footer"
        sx={{
          py: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 3 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Placeholder for TAP button */}
        <Box
          sx={{
            width: { xs: 100, sm: 120 },
            height: { xs: 100, sm: 120 },
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 4,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
            transition: 'all 0.1s ease-in-out',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: 'primary.contrastText',
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '1.75rem' },
            }}
          >
            TAP!
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
