
import re

def clean_css_buffered(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    output = []
    
    buffer = []
    balance = 0
    skipping = False
    skip_to_balance = 0
    
    bad_terms = ["mega-menu-megamenu", "mega-menu-columns", "mega-menu-row"]
    
    for line in lines:
        open_count = line.count('{')
        close_count = line.count('}')
        
        if skipping:
            balance += open_count
            balance -= close_count
            
            # If we drop below the balance we started at, we are done skipping
            if balance < skip_to_balance:
                skipping = False
            continue
            
        # Not skipping
        buffer.append(line)
        
        if '{' in line:
            # Analyze buffer (selector)
            full_text = "".join(buffer)
            
            if "@media" in full_text:
                # Always keep media queries
                is_bad = False
            else:
                is_bad = False
                for term in bad_terms:
                    # Check if term is in specific selector context
                    if term in full_text:
                        is_bad = True
                        break
            
            if is_bad:
                skipping = True
                
                # We are currently at 'balance'.
                # The line adds 'open_count' and subtracts 'close_count'.
                # The block starts at 'balance + 1'.
                # We want to skip until we return to 'balance'.
                skip_to_balance = balance + 1
                
                balance += open_count
                balance -= close_count
                
                # Safety check for one-liners
                if balance < skip_to_balance:
                    skipping = False
                
                # Discard buffer
                buffer = []
                
            else:
                # Good block
                output.extend(buffer)
                buffer = []
                balance += open_count
                balance -= close_count
        
        elif '}' in line:
            # Closing a good block
            output.extend(buffer)
            buffer = []
            balance += open_count
            balance -= close_count
            
    # Flush remaining buffer (comments, whitespace at end)
    if buffer:
        output.extend(buffer)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(output)

clean_css_buffered(r"e:\((_atWork_Old_))\(( Portfolio Business - Zou ))\Zou Website - Loumizou.com\Loumizou.Com-Static-Site\css\style.css", r"e:\((_atWork_Old_))\(( Portfolio Business - Zou ))\Zou Website - Loumizou.com\Loumizou.Com-Static-Site\css\style.clean.css")
