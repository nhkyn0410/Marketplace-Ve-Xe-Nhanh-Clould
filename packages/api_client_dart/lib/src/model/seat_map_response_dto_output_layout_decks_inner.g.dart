// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'seat_map_response_dto_output_layout_decks_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SeatMapResponseDtoOutputLayoutDecksInner
    extends SeatMapResponseDtoOutputLayoutDecksInner {
  @override
  final int deck;
  @override
  final int rows;
  @override
  final int columns;

  factory _$SeatMapResponseDtoOutputLayoutDecksInner(
          [void Function(SeatMapResponseDtoOutputLayoutDecksInnerBuilder)?
              updates]) =>
      (SeatMapResponseDtoOutputLayoutDecksInnerBuilder()..update(updates))
          ._build();

  _$SeatMapResponseDtoOutputLayoutDecksInner._(
      {required this.deck, required this.rows, required this.columns})
      : super._();
  @override
  SeatMapResponseDtoOutputLayoutDecksInner rebuild(
          void Function(SeatMapResponseDtoOutputLayoutDecksInnerBuilder)
              updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SeatMapResponseDtoOutputLayoutDecksInnerBuilder toBuilder() =>
      SeatMapResponseDtoOutputLayoutDecksInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SeatMapResponseDtoOutputLayoutDecksInner &&
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
    return (newBuiltValueToStringHelper(
            r'SeatMapResponseDtoOutputLayoutDecksInner')
          ..add('deck', deck)
          ..add('rows', rows)
          ..add('columns', columns))
        .toString();
  }
}

class SeatMapResponseDtoOutputLayoutDecksInnerBuilder
    implements
        Builder<SeatMapResponseDtoOutputLayoutDecksInner,
            SeatMapResponseDtoOutputLayoutDecksInnerBuilder> {
  _$SeatMapResponseDtoOutputLayoutDecksInner? _$v;

  int? _deck;
  int? get deck => _$this._deck;
  set deck(int? deck) => _$this._deck = deck;

  int? _rows;
  int? get rows => _$this._rows;
  set rows(int? rows) => _$this._rows = rows;

  int? _columns;
  int? get columns => _$this._columns;
  set columns(int? columns) => _$this._columns = columns;

  SeatMapResponseDtoOutputLayoutDecksInnerBuilder() {
    SeatMapResponseDtoOutputLayoutDecksInner._defaults(this);
  }

  SeatMapResponseDtoOutputLayoutDecksInnerBuilder get _$this {
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
  void replace(SeatMapResponseDtoOutputLayoutDecksInner other) {
    _$v = other as _$SeatMapResponseDtoOutputLayoutDecksInner;
  }

  @override
  void update(
      void Function(SeatMapResponseDtoOutputLayoutDecksInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SeatMapResponseDtoOutputLayoutDecksInner build() => _build();

  _$SeatMapResponseDtoOutputLayoutDecksInner _build() {
    final _$result = _$v ??
        _$SeatMapResponseDtoOutputLayoutDecksInner._(
          deck: BuiltValueNullFieldError.checkNotNull(
              deck, r'SeatMapResponseDtoOutputLayoutDecksInner', 'deck'),
          rows: BuiltValueNullFieldError.checkNotNull(
              rows, r'SeatMapResponseDtoOutputLayoutDecksInner', 'rows'),
          columns: BuiltValueNullFieldError.checkNotNull(
              columns, r'SeatMapResponseDtoOutputLayoutDecksInner', 'columns'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
