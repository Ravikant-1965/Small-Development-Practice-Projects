import math
import random
import pygame
import sys
import os

# Constants
ROWS = 6
COLS = 7
PLAYER_PIECE = 1
AI_PIECE = 2
WINDOW_LENGTH = 4
EMPTY = 0

# GUI Constants
SQUARE_SIZE = 100
RADIUS = int(SQUARE_SIZE/2 - 5)
WIDTH = COLS * SQUARE_SIZE
HEIGHT = (ROWS + 1) * SQUARE_SIZE  # Extra row for dropping discs
BLUE = (0, 0, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
YELLOW = (255, 255, 0)
WHITE = (255, 255, 255)
BG_COLOR = (220, 220, 220)

# Sound effects
def load_sound_effects():
    """Load sound effects if audio is available; otherwise return silent stubs."""

    class _SilentSound:
        def play(self):
            pass

        def set_volume(self, *_):
            pass

    silent_sounds = {
        'drop': _SilentSound(),
        'win': _SilentSound(),
        'lose': _SilentSound(),
        'draw': _SilentSound(),
    }

    # Try to init the mixer; if it fails, run silently.
    try:
        pygame.mixer.init()
    except Exception as e:
        print(f"Audio disabled (mixer unavailable): {e}")
        return silent_sounds

    sounds = {}
    sounds_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sounds')

    try:
        sounds['drop'] = pygame.mixer.Sound(os.path.join(sounds_dir, 'Drop.mp3'))
        sounds['win'] = pygame.mixer.Sound(os.path.join(sounds_dir, 'Win.mp3'))
        sounds['lose'] = pygame.mixer.Sound(os.path.join(sounds_dir, 'Lose.mp3'))
        sounds['draw'] = pygame.mixer.Sound(os.path.join(sounds_dir, 'draw.mp3'))

        for sound in sounds.values():
            sound.set_volume(100)

        print("Sound effects loaded successfully.")
    except Exception as e:
        print(f"Error loading sound effects: {e}")
        print("Using silent placeholders. Ensure sound files exist in the 'sounds' directory.")
        sounds = silent_sounds

    return sounds


def create_board():
    return [[EMPTY for _ in range(COLS)] for _ in range(ROWS)]


def drop_piece(board, row, col, piece):
    board[row][col] = piece


def is_valid_location(board, col):
    return 0 <= col < COLS and board[0][col] == EMPTY


def get_next_open_row(board, col):
    for r in range(ROWS-1, -1, -1):
        if board[r][col] == EMPTY:
            return r
    return None


def winning_move(board, piece):
    # Horizontal
    for c in range(COLS-3):
        for r in range(ROWS):
            if all(board[r][c+i] == piece for i in range(WINDOW_LENGTH)):
                return True
    # Vertical
    for c in range(COLS):
        for r in range(ROWS-3):
            if all(board[r+i][c] == piece for i in range(WINDOW_LENGTH)):
                return True
    # Positive diagonal
    for c in range(COLS-3):
        for r in range(ROWS-3):
            if all(board[r+i][c+i] == piece for i in range(WINDOW_LENGTH)):
                return True
    # Negative diagonal
    for c in range(COLS-3):
        for r in range(3, ROWS):
            if all(board[r-i][c+i] == piece for i in range(WINDOW_LENGTH)):
                return True
    return False


def evaluate_window(window, piece):
    score = 0
    opp_piece = PLAYER_PIECE if piece == AI_PIECE else AI_PIECE
    if window.count(piece) == 4:
        score += 100
    elif window.count(piece) == 3 and window.count(EMPTY) == 1:
        score += 5
    elif window.count(piece) == 2 and window.count(EMPTY) == 2:
        score += 2
    if window.count(opp_piece) == 3 and window.count(EMPTY) == 1:
        score -= 4
    return score


def score_position(board, piece):
    score = 0
    center_array = [board[r][COLS//2] for r in range(ROWS)]
    score += center_array.count(piece) * 3
    # Horizontal
    for r in range(ROWS):
        row_array = board[r]
        for c in range(COLS-3):
            score += evaluate_window(row_array[c:c+WINDOW_LENGTH], piece)
    # Vertical
    for c in range(COLS):
        col_array = [board[r][c] for r in range(ROWS)]
        for r in range(ROWS-3):
            score += evaluate_window(col_array[r:r+WINDOW_LENGTH], piece)
    # Positive diagonal
    for r in range(ROWS-3):
        for c in range(COLS-3):
            window = [board[r+i][c+i] for i in range(WINDOW_LENGTH)]
            score += evaluate_window(window, piece)
    # Negative diagonal
    for r in range(WINDOW_LENGTH-1, ROWS):
        for c in range(COLS-3):
            window = [board[r-i][c+i] for i in range(WINDOW_LENGTH)]
            score += evaluate_window(window, piece)
    return score


def get_valid_locations(board):
    return [c for c in range(COLS) if is_valid_location(board, c)]


def is_terminal_node(board):
    return winning_move(board, PLAYER_PIECE) or winning_move(board, AI_PIECE) or not get_valid_locations(board)


def minimax(board, depth, alpha, beta, maximizingPlayer):
    valid_locations = get_valid_locations(board)
    terminal = is_terminal_node(board)
    if depth == 0 or terminal:
        if terminal:
            if winning_move(board, AI_PIECE):
                return (None, float('inf'))
            elif winning_move(board, PLAYER_PIECE):
                return (None, -float('inf'))
            else:
                return (None, 0)
        else:
            return (None, score_position(board, AI_PIECE))
    if maximizingPlayer:
        value = -math.inf
        best_col = random.choice(valid_locations)
        for col in valid_locations:
            row = get_next_open_row(board, col)
            temp_board = [r.copy() for r in board]
            drop_piece(temp_board, row, col, AI_PIECE)
            new_score = minimax(temp_board, depth-1, alpha, beta, False)[1]
            if new_score > value:
                value = new_score
                best_col = col
            alpha = max(alpha, value)
            if alpha >= beta:
                break
        return best_col, value
    else:
        value = math.inf
        best_col = random.choice(valid_locations)
        for col in valid_locations:
            row = get_next_open_row(board, col)
            temp_board = [r.copy() for r in board]
            drop_piece(temp_board, row, col, PLAYER_PIECE)
            new_score = minimax(temp_board, depth-1, alpha, beta, True)[1]
            if new_score < value:
                value = new_score
                best_col = col
            beta = min(beta, value)
            if alpha >= beta:
                break
        return best_col, value


def draw_board(screen, board):
    # Fill the entire screen with background color
    screen.fill(BG_COLOR)
    
    # Draw blue board
    pygame.draw.rect(screen, BLUE, (0, SQUARE_SIZE, WIDTH, HEIGHT - SQUARE_SIZE))
    
    # Draw slots (circles)
    for c in range(COLS):
        for r in range(ROWS):
            pygame.draw.circle(screen, BLACK, 
                               (int(c*SQUARE_SIZE + SQUARE_SIZE/2), 
                                int((r+1)*SQUARE_SIZE + SQUARE_SIZE/2)), 
                               RADIUS)
    
    # Draw pieces
    for c in range(COLS):
        for r in range(ROWS):
            if board[r][c] == PLAYER_PIECE:
                pygame.draw.circle(screen, RED, 
                                  (int(c*SQUARE_SIZE + SQUARE_SIZE/2), 
                                   int((r+1)*SQUARE_SIZE + SQUARE_SIZE/2)), 
                                  RADIUS)
            elif board[r][c] == AI_PIECE:
                pygame.draw.circle(screen, YELLOW, 
                                  (int(c*SQUARE_SIZE + SQUARE_SIZE/2), 
                                   int((r+1)*SQUARE_SIZE + SQUARE_SIZE/2)), 
                                  RADIUS)
    
    # Draw the moving piece in the top row
    if not game_over and current_player == 0:  # Player's turn
        pygame.draw.circle(screen, RED, (mouse_x, int(SQUARE_SIZE/2)), RADIUS)
    
    pygame.display.update()


def animate_drop(screen, board, row, col, piece, sounds):
    color = RED if piece == PLAYER_PIECE else YELLOW
    
    # Play drop sound
    sounds['drop'].play()
    
    # Draw the complete board first to ensure proper background
    draw_board(screen, board)
    
    # Animate the piece dropping
    for i in range(1, row + 2):
        # Redraw only the specific column where animation is happening
        # Draw blue background for this column
        pygame.draw.rect(screen, BLUE, (col*SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE, HEIGHT - SQUARE_SIZE))
        
        # Redraw the empty circles in this column
        for r in range(ROWS):
            # Draw black circle slots
            pygame.draw.circle(screen, BLACK, 
                              (int(col*SQUARE_SIZE + SQUARE_SIZE/2), 
                               int((r+1)*SQUARE_SIZE + SQUARE_SIZE/2)), 
                              RADIUS)
            
            # Redraw any existing pieces in this column
            if board[r][col] == PLAYER_PIECE:
                pygame.draw.circle(screen, RED, 
                                  (int(col*SQUARE_SIZE + SQUARE_SIZE/2), 
                                   int((r+1)*SQUARE_SIZE + SQUARE_SIZE/2)), 
                                  RADIUS)
            elif board[r][col] == AI_PIECE:
                pygame.draw.circle(screen, YELLOW, 
                                  (int(col*SQUARE_SIZE + SQUARE_SIZE/2), 
                                   int((r+1)*SQUARE_SIZE + SQUARE_SIZE/2)), 
                                  RADIUS)
        
        # Draw the animated dropping piece
        pygame.draw.circle(screen, color, 
                          (int(col*SQUARE_SIZE + SQUARE_SIZE/2), 
                           int(i*SQUARE_SIZE - SQUARE_SIZE/2)), 
                          RADIUS)
        
        pygame.display.update()
        pygame.time.wait(50)  # Animation speed
    
    # Update the board model with the new piece
    board[row][col] = piece
    
    # Final redraw to ensure everything is in the correct state
    draw_board(screen, board)


def display_win_message(screen, message, color=WHITE, sounds=None, win_type=None):
    # Play appropriate sound based on win type
    if sounds:
        if win_type == 'player_win':
            sounds['win'].play()
        elif win_type == 'ai_win':
            sounds['lose'].play()
        elif win_type == 'draw':
            sounds['draw'].play()
    
    # Create a semi-transparent overlay for better visibility
    overlay = pygame.Surface((WIDTH, HEIGHT))
    overlay.set_alpha(150)  # Alpha level (transparency)
    overlay.fill(BLACK)
    screen.blit(overlay, (0, 0))
    
    # Create a box for the win message
    font = pygame.font.SysFont('monospace', 60, bold=True)
    text = font.render(message, True, color)
    text_rect = text.get_rect(center=(WIDTH/2, HEIGHT/2 - 50))
    
    # Draw a background box for the message
    padding = 20
    message_box = pygame.Rect(text_rect.left - padding, 
                             text_rect.top - padding,
                             text_rect.width + padding*2,
                             text_rect.height + padding*2)
    pygame.draw.rect(screen, BLUE, message_box, border_radius=15)
    pygame.draw.rect(screen, BLACK, message_box, width=4, border_radius=15)
    
    # Draw the win message
    screen.blit(text, text_rect)
    
    # Draw "Click to play again" message
    restart_font = pygame.font.SysFont('monospace', 30)
    restart_text = restart_font.render("Click to play again", True, WHITE)
    restart_rect = restart_text.get_rect(center=(WIDTH/2, HEIGHT/2 + 50))
    screen.blit(restart_text, restart_rect)
    
    pygame.display.update()


def play_game():
    global game_over, current_player, mouse_x
    
    # Initialize pygame if not already done
    if not pygame.get_init():
        pygame.init()
    
    # Load sound effects
    sounds = load_sound_effects()
    
    # Set up the display
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption('Connect Four')
    
    # Initialize game state
    board = create_board()
    game_over = False
    current_player = random.choice([0, 1])  # 0: Player, 1: AI
    mouse_x = WIDTH // 2
    
    # Draw initial board
    draw_board(screen, board)
    
    # If AI starts, make its move
    if current_player == 1:
        pygame.time.wait(500)
        col, _ = minimax(board, 5, -math.inf, math.inf, True)
        row = get_next_open_row(board, col)
        animate_drop(screen, board, row, col, AI_PIECE, sounds)
        
        # Check if AI won with first move (unlikely but possible with custom board)
        if winning_move(board, AI_PIECE):
            game_over = True
            draw_board(screen, board)
            display_win_message(screen, "AI WINS!", YELLOW, sounds, 'ai_win')
        else:
            current_player = 0
            draw_board(screen, board)
    
    # Main game loop
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            
            if event.type == pygame.MOUSEMOTION and not game_over:
                # Update the position of the moving piece at the top
                mouse_x = event.pos[0]
                draw_board(screen, board)
            
            if event.type == pygame.MOUSEBUTTONDOWN:
                # When game is over, any click restarts
                if game_over:
                    pygame.time.wait(500)  # Small delay before restart
                    play_game()  # Restart the game
                    return  # Exit this instance of the game
                
                # Player's turn
                if current_player == 0:
                    col = event.pos[0] // SQUARE_SIZE
                    
                    if is_valid_location(board, col):
                        row = get_next_open_row(board, col)
                        animate_drop(screen, board, row, col, PLAYER_PIECE, sounds)
                        
                        # Check for player win
                        if winning_move(board, PLAYER_PIECE):
                            game_over = True
                            draw_board(screen, board)
                            display_win_message(screen, "PLAYER WINS!", RED, sounds, 'player_win')
                        # Check for draw
                        elif not get_valid_locations(board):
                            game_over = True
                            draw_board(screen, board)
                            display_win_message(screen, "DRAW!", WHITE, sounds, 'draw')
                        else:
                            current_player = 1
                            draw_board(screen, board)
        
        # AI's turn
        if not game_over and current_player == 1:
            pygame.time.wait(750)  # Add a delay to make AI moves visible
            
            # Check for immediate win
            valid_locations = get_valid_locations(board)
            col = None
            
            # Try to win
            for c in valid_locations:
                r = get_next_open_row(board, c)
                temp_board = [r.copy() for r in board]
                drop_piece(temp_board, r, c, AI_PIECE)
                if winning_move(temp_board, AI_PIECE):
                    col = c
                    break
                    
            # Block opponent's win
            if col is None:
                for c in valid_locations:
                    r = get_next_open_row(board, c)
                    temp_board = [r.copy() for r in board]
                    drop_piece(temp_board, r, c, PLAYER_PIECE)
                    if winning_move(temp_board, PLAYER_PIECE):
                        col = c
                        break
                        
            # Use minimax for other moves
            if col is None:
                col, _ = minimax(board, 5, -math.inf, math.inf, True)
            
            # Execute AI's move
            row = get_next_open_row(board, col)
            animate_drop(screen, board, row, col, AI_PIECE, sounds)
            
            # Check for AI win
            if winning_move(board, AI_PIECE):
                game_over = True
                draw_board(screen, board)
                display_win_message(screen, "AI WINS!", YELLOW, sounds, 'ai_win')
            # Check for draw
            elif not get_valid_locations(board):
                game_over = True
                draw_board(screen, board)
                display_win_message(screen, "DRAW!", WHITE, sounds, 'draw')
            else:
                current_player = 0
                draw_board(screen, board)


if __name__ == "__main__":
    # Initialize pygame
    pygame.init()
    
    # Global variables
    game_over = False
    current_player = 0
    mouse_x = 0
    
    # Start the game
    play_game()
