// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'seat_map_input_dto_layout_decks_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SeatMapInputDtoLayoutDecksInner
    extends SeatMapInputDtoLayoutDecksInner {
  @override
  final int deck;
  @override
  final int rows;
  @override
  final int columns;

  factory _$SeatMapInputDtoLayoutDecksInner(
          [void Function(SeatMapInputDtoLayoutDecksInnerBuilder)? updates]) =>
      (SeatMapInputDtoLayoutDecksInnerBuilder()..update(updates))._build();

  _$SeatMapInputDtoLayoutDecksInner._(
      {required this.deck, required this.rows, required this.columns})
      : super._();
  @override
  SeatMapInputDtoLayoutDecksInner rebuild(
          void Function(SeatMapInputDtoLayoutDecksInnerBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SeatMapInputDtoLayoutDecksInnerBuilder toBuilder() =>
      SeatMapInputDtoLayoutDecksInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SeatMapInputDtoLayoutDecksInner &&
        deck == other.deck &&
        rows == other.rows &&
        columns == other.columns;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, deck.hashCode);
    _$hash = $jc(_$hash, rows.hashCode);
    _$hash = $jc(_$hash, columns.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SeatMapInputDtoLayoutDecksInner')
          ..add('deck', deck)
          ..add('rows', rows)
          ..add('columns', columns))
        .toString();
  }
}

class SeatMapInputDtoLayoutDecksInnerBuilder
    implements
        Builder<SeatMapInputDtoLayoutDecksInner,
            SeatMapInputDtoLayoutDecksInnerBuilder> {
  _$SeatMapInputDtoLayoutDecksInner? _$v;

  int? _deck;
  int? get deck => _$this._deck;
  set deck(int? deck) => _$this._deck = deck;

  int? _rows;
  int? get rows => _$this._rows;
  set rows(int? rows) => _$this._rows = rows;

  int? _columns;
  int? get columns => _$this._columns;
  set columns(int? columns) => _$this._columns = columns;

  SeatMapInputDtoLayoutDecksInnerBuilder() {
    SeatMapInputDtoLayoutDecksInner._defaults(this);
  }

  SeatMapInputDtoLayoutDecksInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _deck = $v.deck;
      _rows = $v.rows;
      _columns = $v.columns;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SeatMapInputDtoLayoutDecksInner other) {
    _$v = other as _$SeatMapInputDtoLayoutDecksInner;
  }

  @override
  void update(void Function(SeatMapInputDtoLayoutDecksInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SeatMapInputDtoLayoutDecksInner build() => _build();

  _$SeatMapInputDtoLayoutDecksInner _build() {
    final _$result = _$v ??
        _$SeatMapInputDtoLayoutDecksInner._(
          deck: BuiltValueNullFieldError.checkNotNull(
              deck, r'SeatMapInputDtoLayoutDecksInner', 'deck'),
          rows: BuiltValueNullFieldError.checkNotNull(
              rows, r'SeatMapInputDtoLayoutDecksInner', 'rows'),
          columns: BuiltValueNullFieldError.checkNotNull(
              columns, r'SeatMapInputDtoLayoutDecksInner', 'columns'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
