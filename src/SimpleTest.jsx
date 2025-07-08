import React from 'react'

function SimpleTest() {
    console.log('SimpleTest renderizado')

    return (
        <div style={{
            minHeight: '100vh',
            background: '#1a0b2e',
            color: '#d4af37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🔮</h1>
                <h2>Oráculo de la Suerte</h2>
                <p>Prueba de funcionamiento básico</p>
                <button
                    style={{
                        background: '#d4af37',
                        color: '#1a0b2e',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        fontSize: '16px',
                        marginTop: '20px',
                        cursor: 'pointer'
                    }}
                    onClick={() => alert('¡Funciona!')}
                >
                    Hacer clic aquí
                </button>
            </div>
        </div>
    )
}

export default SimpleTest
