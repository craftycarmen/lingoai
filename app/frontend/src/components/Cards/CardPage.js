import {
  Container,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Grid,
  Card,
<<<<<<< HEAD
=======
  Button,
  LinearProgress
>>>>>>> origin/carmen-fixes
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
  useParams,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import { useDispatch, useSelector } from "react-redux";
import { fetchOneDeck, archiveDeck } from "../../store/decks";
import { fetchUserAttempt, modifyUserAttempt } from "../../store/attempt";
import Flippy, { FrontSide, BackSide } from 'react-flippy';

function CardPage() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { deckId } = useParams();
  const location = useLocation();
  const user = useSelector((state) => state.session.user);
  const deck = useSelector((state) => state.decks.selectedDeck);
  const cards = deck?.cards?.[0]?.questionData?.jsonData || [];
  const attempt = useSelector((state) => state.attempts);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [flipped, setFlipped] = useState({})
  //const attemptId = useSelector((state) => state.userAttempts);
  const { attemptId } = location.state || {};
  const topicName = deck?.cards?.[0]?.questionData?.topic;
  const topicLevel = deck?.level;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await dispatch(fetchOneDeck(deckId));
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
    fetchData();

  }, [dispatch, deckId, attemptId]);


  const handleAnswerChange = async (cardIndex, optionIndex, questionId) => {
    const selectedOption = cards[cardIndex].options[optionIndex];
    try {
      // Update local state
      setSelectedAnswers((prevAnswers) => ({
        ...prevAnswers,
        [cardIndex]: optionIndex,
      }));

      const checkAttempt = await dispatch(
        modifyUserAttempt(
          user.uid,
          questionId,
          attemptId,
          selectedOption,
          deckId
        )
      );

      if (checkAttempt && checkAttempt.message === "Answer is correct!") {
        setFeedback((prevFeedback) => ({
          ...prevFeedback,
          [cardIndex]: {
            isCorrect: true
          },
        }));
      } else if (
        checkAttempt &&
        checkAttempt.message === "Answer is incorrect."
      ) {
        setFeedback((prevFeedback) => ({
          ...prevFeedback,
          [cardIndex]: {
            isCorrect: false,
            correctAnswer: checkAttempt.correctAnswer,
          },
        }));
      }
      // if (checkAttempt && checkAttempt.message === "Answer is correct!") {
      //   setFeedback({ cardIndex, isCorrect: true });
      // } else if (
      //   checkAttempt &&
      //   checkAttempt.message === "Answer is incorrect."
      // ) {
      //   setFeedback({
      //     cardIndex,
      //     isCorrect: false,
      //     correctAnswer: checkAttempt.correctAnswer,
      //   });
      // }

      const allQuestionsAttempted = Object.keys(selectedAnswers).length === cards.length - 1;

      if (allQuestionsAttempted) {
        await dispatch(archiveDeck(deckId, user.uid));
        await dispatch(fetchOneDeck(deckId))
        console.log("Deck archived")
      }
    } catch (error) {
      console.error("Error modifying user attempt:", error);
    }
  };

  const handleFlip = (cardIndex) => {
    if (!flipped[cardIndex]) {
      setFlipped((prevState) => ({
        ...prevState,
        [cardIndex]: true
      }))
    }
  }

  if (loading) {
    return <LinearProgress />;
  }

  console.log(deck);

  return (
    <>
      <h1 style={{ textAlign: "center", marginBottom: 0 }}>{topicName}</h1>
      <h3 style={{ textAlign: "center", marginTop: 0 }}>{topicLevel}</h3>
      {!deck?.archived && (
        <p style={{ textAlign: "center" }}>Each card contains four options. Select your answer to see if it's correct.</p>
      )}
      <Container
        sx={{
          display: "grid",
          justifyContent: "space-evenly",
          minHeight: "100vh",
          paddingBottom: "100px",
          p: 2,
        }}
      >
        <Grid container spacing={2}>
          {cards.map((card, cardIndex) => (
            <React.Fragment key={card.id}>
              {!card.isAttempted ? (

                <React.Fragment>
                  {/* QUESTION CARD */}
                  <Flippy
                    key={card.id}
                    flipOnHover={false}
                    flipOnClick={false}
                    flipDirection="horizontal"
                    isFlipped={flipped[cardIndex] || feedback[cardIndex] !== undefined}
                    onClick={() => handleFlip(cardIndex)}
                  // ref={(r) => this.flippy = r}
                  >
                    <Grid item xs={12} md={4}>

                      <FrontSide
                        style={{
                          backgroundColor: "transparent",
                          boxShadow: "none"
                        }}
                      >
                        <Card
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            width: "300px",
                            height: "450px",
                            borderRadius: "3px",
                            border: `1.5px solid ${theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                              }`,
                          }}
                        >
                          <Box
                            sx={{
                              backgroundColor: `${theme.palette.divider.main}`,
                              height: "300px",
                              padding: "20px",
                              overflow: "auto",
                            }}
                          >
                            {/* <h2 style={{ margin: "0" }}>{card.question}</h2> */}
                            <h2
                              style={{ margin: "0" }}
                              dangerouslySetInnerHTML={{
                                __html: card.question.split('\n')
                                  .map(line => `<div style="margin: 0; padding: 0; margin-bottom: 10px;">${line}</div>`)
                                  .join('')
                              }}>
                            </h2>

                          </Box>
                          <Box
                            sx={{
                              backgroundColor: `${theme.palette.background.main}`,
                              height: "150px",
                              padding: "10px",
                              borderTop: `1.5px solid ${theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                                }`,
                              overflow: "auto",
                              display: "flex",
                              alignContent: "center",
                            }}
                          >
                            <FormControl>
                              <RadioGroup
                                row
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                name="row-radio-buttons-group"
                                sx={{
                                  display: "grid",
                                  // gridTemplateColumns: "repeat(2, 1fr)",
                                  gridAutoFlow: "row",
                                  // gap: "5px",
                                  alignItems: "center",
                                  width: "fit-content",
                                  height: "fit-content",
                                  overflow: "auto",
                                  padding: "5px",
                                }}
                                onChange={(e) =>
                                  handleAnswerChange(
                                    cardIndex,
                                    parseInt(e.target.value),
                                    card.id
                                  )
                                }
                              >
                                {card.options.map((option, optionIndex) => (
                                  <FormControlLabel
                                    key={optionIndex}
                                    value={optionIndex} // Set the index as the value
                                    control={
                                      <Radio
                                        sx={{ color: theme.palette.primary.main, width: "30px", height: "30px" }}
                                      />
                                    }
                                    label={option}
                                    sx={{
                                      margin: 0,
                                      width: "100%",
                                      // maxWidth: "130px",
                                      display: "flex",
                                      alignItems: "center", // Vertically centers content within each grid cell
                                      justifyContent: "flex-start",
                                      height: "100%",
                                      gap: "10px",

                                    }}
                                  />
                                ))}
                              </RadioGroup>
                            </FormControl>
                          </Box>
                        </Card>
                      </FrontSide>
                    </Grid>
                    <BackSide
                      style={{
                        backgroundColor: "transparent",
                        boxShadow: "none"
                      }}
                    >
                      {/* CORRECT ANSWER */}
                      {feedback[cardIndex]?.isCorrect && (
                        <Grid item xs={12} md={4}>
                          <Card
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              width: "300px",
                              height: "450px",
                              borderRadius: "3px",
                              border: `1.5px solid ${theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                                }`,
                            }}
                          >
                            <Box
                              sx={{
                                backgroundColor: `${theme.palette.secondary.main}`,
                                height: "300px",
                                padding: "20px",
                                overflow: "auto",
                              }}
                            >
                              <h2 style={{ margin: "0" }}>{card.question}</h2>
                              <FormLabel disabled>
                                <Typography
                                  sx={{ color: theme.palette.text.primary, mt: 2 }}
                                >
                                  Correct!
                                </Typography>
                                <Typography
                                  sx={{ color: theme.palette.text.primary, mt: 2 }}
                                >
                                  {card.explanation}
                                </Typography>
                              </FormLabel>
                            </Box>
                            <Box
                              sx={{
                                backgroundColor: `${theme.palette.background.main}`,
                                height: "150px",
                                padding: "10px",
                                borderTop: `1.5px solid ${theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                                  }`,
                                overflow: "auto",
                                display: "flex",
                                alignContent: "center",
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <CheckIcon
                                  sx={{ color: theme.palette.completion.good }}
                                />
                                <Typography sx={{ ml: 2 }}>{card.answer}</Typography>
                              </Box>
                            </Box>
                          </Card>
                        </Grid>
                      )}

                      {/* INCORRECT ANSWER */}
                      {/* {!feedbackcardIndex === cardIndex && !feedback.isCorrect && ( */}
                      {!feedback[cardIndex]?.isCorrect && feedback[cardIndex] && (
                        <Grid item xs={12} md={4}>
                          <Card
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              width: "300px",
                              height: "450px",
                              borderRadius: "3px",
                              border: `1.5px solid ${theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                                }`,
                            }}
                          >
                            <Box
                              sx={{
                                backgroundColor: `${theme.palette.primary.main}`,
                                height: "300px",
                                padding: "20px",
                                overflow: "auto",
                              }}
                            >
                              <h2 style={{ margin: "0" }}>{card.question}</h2>
                              <FormLabel disabled>
                                <Typography
                                  sx={{ color: theme.palette.text.primary, mt: 2 }}
                                >
                                  Incorrect!
                                </Typography>
                                <Typography
                                  sx={{ color: theme.palette.text.primary, mt: 2 }}
                                >
                                  {card.explanation}
                                </Typography>
                              </FormLabel>
                            </Box>
                            <Box
                              sx={{
                                backgroundColor: `${theme.palette.background.main}`,
                                height: "150px",
                                padding: "10px",
                                borderTop: `1.5px solid ${theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                                  }`,
                                overflow: "auto",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column"
                              }}
                            >
                              {/* <Typography sx={{ ml: 2 }}>
                          {feedback.correctAnswer}
                          </Typography> */}
                              <CloseIcon
                                sx={{ color: theme.palette.completion.poor }}
                              />
                              <p><span style={{ fontWeight: "bold" }}>Correct answer:</span> {feedback[cardIndex]?.correctAnswer}</p>
                            </Box>
                          </Card>
                        </Grid>
                      )}
                    </BackSide>
                  </Flippy>
                </React.Fragment>


              ) : (
                <Grid item xs={12} md={4}>
                  <Card
                    key={card.id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "300px",
                      height: "450px",
                      borderRadius: "3px",
                      border: `1.5px solid ${theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                        }`,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: `${theme.palette.secondary.main}`,
                        height: "300px",
                        padding: "20px",
                        overflow: "auto",
                      }}
                    >
                      <h2 style={{ margin: "0" }}>{card.question}</h2>
                      <FormLabel disabled>
                        <Typography
                          sx={{ color: theme.palette.text.primary, mt: 2 }}
                        >
                          {card.explanation}
                        </Typography>
                      </FormLabel>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: `${theme.palette.background.main}`,
                        height: "150px",
                        padding: "10px",
                        borderTop: `1.5px solid ${theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                          }`,
                        overflow: "auto",
                        display: "flex",
                        alignContent: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CheckIcon
                          sx={{ color: theme.palette.completion.good }}
                        />
                        <Typography sx={{ ml: 2 }}>{card.answer}</Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>

              )}
            </React.Fragment>
          ))}
        </Grid>
      </Container >
    </>
  );
}

export default CardPage;
