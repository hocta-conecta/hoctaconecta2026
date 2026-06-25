import streamlit.components.v1 as components
import os

_component_func = components.declare_component(
    "kanban_board",
    path=os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend")
)

def kanban_board(columns, key=None):
    """
    columns: list of dicts {header, etapa, color, items}
    items: list of dicts {id, title, sub, followup, vencido, hoje}
    Returns {card_id, new_etapa} when a card is moved, else None.
    """
    return _component_func(columns=columns, key=key, default=None)
