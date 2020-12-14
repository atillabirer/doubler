import React, { useEffect, useState } from 'react';
import { AppBar, Button, Container, createMuiTheme, CssBaseline, IconButton, makeStyles, ThemeProvider, Toolbar, Typography } from "@material-ui/core";
import PayoutTable from './PayoutTable';
import { spacing } from '@material-ui/system';
import { MenuIcon } from '@material-ui/data-grid';
import GameRulesDialog from './GameRulesDialog';


const mui = createMuiTheme({
  palette: {
    type: "dark"
  }
})

const styles = makeStyles({
  container: {
    display: "flex",
    minHeight: "100vh",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10
  },
  title: {
    fontFamily: "'Press Start 2P'",
    margin: 10
  },
  address: {
    fontFamily: "'Press Start 2P'",
    color: "red",
    margin: 10
  },
  pot: {
    fontFamily: "'Press Start 2P'",
    color: "green",
    margin: 10
  },
  menuButton: {
    marginRight: "auto"
  },
  payout: {
    fontFamily: "'Press Start 2P'",
    margin: 10
  }
})

interface Investment {
  address: string;
  amount: number;
  txid: string;
  timestamp: number;
  paid: boolean;
}


function App() {
  const style = styles()
  const [address,setAddress] = useState("");

  const [balance,setBalance] = useState(0);
  const [investments,setInvestments] = useState<Investment[]>([]);

  useEffect(() => {
    async function getInvestments() {
      const raw = await fetch("http://localhost:8888/transactions")
      const json = await raw.json()
      console.log(json)
      setInvestments(json)
    
    }
    async function getAddress() {
      const raw = await fetch("http://localhost:8888/depositaddress")
      const json = await raw.json()
      console.log(json)
      setAddress(json.depositaddress)
    
    }

    async function getBalance() {
      const raw = await fetch("http://localhost:8888/balance")
      const json = await raw.json()
      console.log(json)
      setBalance(json.balance)
    
    }
    getInvestments()
    getAddress()
    getBalance()
  },[])

  return (
    <ThemeProvider theme={mui}>
      <CssBaseline />
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" className={style.menuButton}>
            DoublerCoin
    </Typography>
    <GameRulesDialog/>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" className={style.container}>
        <Typography align="center" className={style.title}>You are an investor in the brand new ICO project DoublerCoin(tm).
        You realize that the developers are too busy partying with Filipino escorts and driving yachts than working on the project.
        You have only one chance to profit and screw over other investors.
           Get in and out before the project collapses.</Typography>
        <Typography variant="h6" className={style.address}>{address}</Typography>

        <Typography className={style.pot}>Current Pot: {balance} LTC</Typography>
        
        <Typography className={style.payout}>Payout Table</Typography>
        <PayoutTable rows={investments}/>
      </Container>
    </ThemeProvider>
  );
}

export default App;
